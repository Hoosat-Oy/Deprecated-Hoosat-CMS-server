// Import Multer route to /
import { Router } from 'express-serve-static-core';
import path from 'path';
import dotenv from "dotenv";
import multer from '../lib/common/Multer';
import authentication from "./access/authentication";
import groups from "./access/groups";
import members from "./access/members";
import articles from "./cms/articles";
import pages from './cms/pages';
import contactForm from './common/contactForm';

import React from 'react';
import ReactDOMServer from 'react-dom/server';

export const EnableRoutes = (app: {
  get(arg0: string, arg1: (req: any, res: any) => void): unknown; 
  use: (arg0: string, arg1: Router) => void; 
}) => {
  const dirname = path.resolve();
  if(process.env.FILE_UPLOAD_ENABLED === "true") {
    app.use("/", multer.router);
    console.log(`FILE_UPLOAD_ENABLED == ${process.env.FILE_UPLOAD_ENABLED}`);
  }
  if(process.env.AUTHENTICATION_ENABLED === "true") {
    app.use("/api", authentication.router);
    console.log(`AUTHENTICATION_ENABLED == ${process.env.AUTHENTICATION_ENABLED}`);
  }
  if(process.env.GROUPS_ENABLED === "true") {
    app.use("/api", groups.router);
    console.log(`GROUPS_ENABLED == ${process.env.GROUPS_ENABLED}`);
  } 
  if(process.env.MEMBERS_ENABLED === "true") {
    app.use("/api", members.router);
    console.log(`MEMBERS_ENABLED == ${process.env.MEMBERS_ENABLED}`);
  } 
  if(process.env.ARTICLES_ENABLED == "true") {
    app.use("/api", articles.router);
    console.log(`ARTICLES_ENABLED == ${process.env.ARTICLES_ENABLED}`);
  }
  if(process.env.PAGES_ENABLED == "true") {
    app.use("/api", pages.router);
    console.log(`PAGES_ENABLED == ${process.env.PAGES_ENABLED}`);
  }
  if(process.env.CONTACT_FORM_ENABLED == "true") {
    app.use("/api", contactForm.router);
    console.log(`CONTACT_FORM_ENABLED == ${process.env.CONTACT_FORM_ENABLED}`);
  }
  
  // Catch all other routes, serve client build if it exists.
  app.get('*', (req, res) => {
    res.sendFile(path.join(dirname + '/../client/build/'));
  });
}
