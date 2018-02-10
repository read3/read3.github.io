"use strict";

const fs = require('fs');
const http = require('http');
const url = require('url');
const querystring = require('querystring');


let writeAlertJsonInfo = function(req, res){
	
	res.write('alertJson = '+ JSON.stringify(alertJson)+ ';' );
	res.write('alertApp.onready();');
	res.write('</script></body></html>');
	res.end();
}

let homepage = function(req, res){
	res.writeHead(200, {'Content-Type':'text/html'});

	res.end('hello');
}

let newItem = function(req, res, config){
	res.writeHead(200, {'Content-Type':'application/json'});
	
	config.response = res;
	
	//get6.getdata(config);
	
}

const shareIDs = {}; //shareID: {articleID:, left:3} 
const articleIDs = {}; //articleID: {content:, count:}

let saveArticle = function(req, res, postItems){
	res.writeHead(200, {'Content-Type':'application/json'});
    
    let data = {shareID: '', error: 0};
    
    if(! postItems.content){
        data.error = 1;
        return res.end(JSON.stringify(data));
    } 
    
    
    let articleID = Math.random().toString(36).substring(2);
    let shareID = Math.random().toString(36).substring(2);
    
    articleIDs[articleID] = {
        
        content: postItems.content,
        count: 1
    };
    
    shareIDs[shareID] = {
        articleID: articleID,
        left: 3
    }
    
    data.shareID = shareID;
    		
    res.end(JSON.stringify(data));
	
}

let shareArticle = function(req, res, postItems){
	res.writeHead(200, {'Content-Type':'application/json'});
    
    let data = {shareID: '', error: 0};
    
    let shareID = postItems.shareID;
    
    if(!(shareID &&  shareID in shareIDs)){
        data.error = 1;
        return res.end(JSON.stringify(data));
    } 
    
    
    let articleID = shareIDs[shareID].articleID;
    
    ++ articleIDs[articleID].count;
    
    let newShareID = Math.random().toString(36).substring(2);
    data.shareID = newShareID;
    
    shareIDs[newShareID] = {
        articleID: articleID,
        left: 3
    }

    res.end(JSON.stringify(data));
}

let getArticle = function(req, res, postItems){
	res.writeHead(200, {'Content-Type':'application/json'});
    
    let data = {content: '', error: 0, count: 0};
    
    let shareID = postItems.shareID;
    
    if(!(shareID &&  shareID in shareIDs)){
        data.error = 1;
        return res.end(JSON.stringify(data));
    } 
    
    
    let articleID = shareIDs[shareID].articleID;

    let left = -- shareIDs[shareID].left;
    
    data.count = 3 - left;
    data.content = articleIDs[articleID].content;
    
    res.end(JSON.stringify(data));
    
    if(left === 0){
        delete shareIDs[shareID];
        
        
        let count = -- articleIDs[articleID].count;
        
        if(count === 0) delete articleIDs[articleID];
        
    } 
	
}

let startHttpServer = function(){
	http.createServer(function(req, res) {
		const host = req.headers.host;
		const hostname = url.parse('http://'+host).hostname;

		let pathname = url.parse(req.url).pathname;
		console.log(pathname);
        
        var postData = '';     
        var postItems = {};
        
        req.on('data', function(chunk){    
            postData += chunk;
        });
 
        res.setHeader('Access-Control-Allow-Origin', 'https://read3.github.io');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Max-Age', '86400');
        
		if( pathname === '/' ){
			homepage(req, res);
		}else if( pathname.slice(0,4) === '/get' ){
			    
			
		  	req.on('end', function(){    
				postItems = querystring.parse(postData);
				console.log(postItems);
				getArticle(req, res, postItems);
			});	  
		  
		}else if( pathname.slice(0,5) === '/save' ){
 
			req.on('end', function(){    
				postItems = querystring.parse(postData);
				console.log(postItems);
				saveArticle(req, res, postItems);
			});
		  		  
		  
		}else if( pathname.slice(0,6) === '/share' ){
 
			req.on('end', function(){    
				postItems = querystring.parse(postData);
				console.log(postItems);
				shareArticle(req, res, postItems);
			});
		  		  
		  
		}
		
	}).listen(8086,()=>{
	   console.log('listen on port 8086...');
	 });
}

//--------test begin---------------------
/*
startHttpServer();
*/
//---------test end----------------------

exports.start = function(){
	startHttpServer();
}