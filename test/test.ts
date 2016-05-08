/// <reference path="../typings/main.d.ts" />
import * as sc from '../lib/index';
import request=require('superagent');
import * as express from 'express';
import * as chai from 'chai';
import * as http from 'http';
const expect= chai.expect;
const PORT=31241;

describe('Site container', () => {
    let server:http.Server;
    beforeEach(done=> {
        const app=sc.site_container_create("./site");
        server=app.listen(PORT,done);
    });
    afterEach(()=>{
        server.close(); 
    });
    describe('domains', () => {
        it('should get default file for  http://www.test.com/', (done) => {
            request.get(`http://localhost:${PORT}/`).set("Host","www.test.com").end((e,r)=>{
                console.log(r.text);
               expect(r.text).contains("hello from www.test.com");
               done(e);
            });
        });
        it('should get default file for  http://test.com/', (done) => {
            request.get(`http://localhost:${PORT}/`).set("Host","test.com").end((e,r)=>{
               expect(r.text).contains("hello from www.test.com");
               done(e);
            });
        });
        
        it('should get file by full uri http://www.test.com/index.htm', (done) => {
            request.get(`http://localhost:${PORT}/index.htm`).set("Host","www.test.com").end((e,r)=>{
               expect(r.text).contains("hello from www.test.com");
               done(e);
            });
        });
        
        it('should get default file for  http://test.com/subfolder/', (done) => {
            request.get(`http://localhost:${PORT}/subfolder/`).set("Host","test.com").end((e,r)=>{
               expect(r.text).contains("hello subfolder from www.test.com");
               done(e);
            });
        });        
        it('should get file by full uri http://www.test.com/subfolder/index.htm', (done) => {
            request.get(`http://localhost:${PORT}/subfolder/index.htm`).set("Host","www.test.com").end((e,r)=>{
               expect(r.text).contains("hello subfolder from www.test.com");
               done(e);
            });
        });
        
         it('should get file by localhost uri http://locahost/', (done) => {
            request.get(`http://localhost:${PORT}/`).end((e,r)=>{
               expect(r.text).contains("hello from localhost");
               done(e);
            });
        });
    });
});