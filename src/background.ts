'use strict'

import {app, BrowserWindow, ipcMain, protocol} from 'electron'
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib'
import installExtension from 'electron-devtools-installer'
import ElectronStore from "electron-store";
import HttpFetcher from "@/http/HttpFetcher";
import {IssueConstants} from "@/constants/IssueConstants";
import {extractArguments, extractIngestReferences, removeContentPrefix} from "@/fix/fixingHelper";
import PatchRequest from "@/http/PatchRequest";

const isDevelopment = process.env.NODE_ENV !== 'production'
const store = new ElectronStore();

const STUDIO_URL:string="https://studio.uat.dior.coremedia.cloud/";
const INGEST_URL:string="https://ingest.uat.dior.coremedia.cloud";

const path = require('path')
const Module = require('module')
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    {scheme: 'app', privileges: {secure: true, standard: true}}
])
const PATH_APP_NODE_MODULES = path.join(__dirname, '..', '..', 'app', 'node_modules')
Module.globalPaths.push(PATH_APP_NODE_MODULES)

let win: BrowserWindow;
const httpFetcher = new HttpFetcher();

async function createWindow() {
    // Create the browser window.
    console.error("current directory for icon is " + __dirname + '/icons/CM-1024.png')

    win = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            partition: 'persist:infragistics',
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: !!process.env.ELECTRON_NODE_INTEGRATION,
            contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
            webviewTag: true,
        }
    })

    const session = win.webContents.session;


    session.cookies.on("changed", handleCookieChange);

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL("https://studio.uat.dior.coremedia.cloud/")
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('app://./index.html')
        //win.loadURL("https://studio.production.dior.coremedia.cloud/");
    }
}

//@ts-ignore
async function handleCookieChange(event, cookie) {
    //console.log(cookie);
    //console.log("Cookie" + event + " " + JSON.stringify(cookie));
    if (cookie.name === "CLOUD_SESSIONID") {
        /**
         * Handle the fix of issues, in our case the dead links. Not really great right now, TODO://needs refactoring
         */
        ipcMain.on(IssueConstants.FIX_DEAD_LINKS, async (event, data) => {
            console.log("Start fixing dead links " + JSON.stringify(data));
            for (const item of data) {
                console.log(Object.keys(item) + " " + item.contentId + typeof item.contentId)
                const id = removeContentPrefix(item.contentId);
                const contentToRemove: Array<string> = extractArguments("dead_link", item);
                //get the ingest response, and fix the field.
                try {
                    const ingest = await httpFetcher.getContent("https://ingest.uat.dior.coremedia.cloud", id, "eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3d3dy5jb3JlbWVkaWEuY29tIiwic3ViIjoiamhsaW5rZUBjb2duaXRvIiwiaWF0IjoxNzAwMDQzMDY3LCJwZXJtaXNzaW9ucyI6WyJzZWNvbmQ6Y29udGVudF9yZWFkIiwidGhpcmQ6Y29udGVudF93cml0ZSIsInVhdDpjb250ZW50X3dyaXRlIiwidWF0Mjpjb250ZW50X3dyaXRlIiwidWF0Mjpjb250ZW50X3JlYWQiLCJ1YXQ6Y29udGVudF9yZWFkIiwidGhpcmQ6Y29udGVudF9yZWFkIiwic2Vjb25kOmNvbnRlbnRfd3JpdGUiLCJwcm9kdWN0aW9uOmNvbnRlbnRfd3JpdGUiLCJkZXZlbG9wbWVudDpjb250ZW50X3dyaXRlIiwiZGV2ZWxvcG1lbnQ6Y29udGVudF9yZWFkIiwicHJvZHVjdGlvbjpjb250ZW50X3JlYWQiXSwianRpIjoiODJlMzM2NjQtMzY4Ni00ODE4LWI3ZjYtNmJlMTQxNTA2YzllIn0.VORVOeiazSi8h-4ws-I9WZgbeKf5NYgxPInggH9tVy090xZgXynCNr-2CvWnBkWhilhT1G_2nbljDkhd_8fsxL5nZ6P4LuFRdJPtA2HrkWslZNu1gsU45ClRlOBIcF9hjeSHKMgR8sKzwhrBxEGvbmiUkm858fnq0dMpS6Z6_06Yb2NEHI88xQpEYy7QrxU14yaiF0y0fn1I-KiWhXHDKtQol5zauKsryZONk78XykXv2GK7i5Mnt1DlXkIqb3rowjLTdQzAUbzz_8mGMGOup3C8JsMv7T0qcJnCbKWieBY9h-scQ79dBjOe6uKpqR7J8D1G7qw8DHjiu5mHaUbxrA");
                    console.log(JSON.stringify(ingest.data.properties[item.property]));
                    const ingestRefs: Array<any> = extractIngestReferences(ingest, item.property);
                    const itemsToSet: any[] = ingestRefs.filter((candidate: any) => {
                        console.log("the candidate" + JSON.stringify(candidate) + " and " + JSON.stringify(contentToRemove));
                        for (let i = 0; i <= contentToRemove.length; i++) {
                            if (candidate.id.indexOf(contentToRemove[i]) > 0) {
                                return false;
                            }
                        }
                        return true;
                    });

                    ingest.data.properties[item.property].references=itemsToSet;

                    const patchObj:PatchRequest = new PatchRequest();
                    patchObj.setType(ingest.data.type);
                    patchObj.setUuid(ingest.data.uuid);
                    patchObj.addLinkProperty(item.property,itemsToSet)

                    console.log(JSON.stringify(patchObj));
                    const writeResult = await httpFetcher.setContent("https://ingest.uat.dior.coremedia.cloud",
                        id,
                        "eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3d3dy5jb3JlbWVkaWEuY29tIiwic3ViIjoiamhsaW5rZUBjb2duaXRvIiwiaWF0IjoxNzAwMDQzMDY3LCJwZXJtaXNzaW9ucyI6WyJzZWNvbmQ6Y29udGVudF9yZWFkIiwidGhpcmQ6Y29udGVudF93cml0ZSIsInVhdDpjb250ZW50X3dyaXRlIiwidWF0Mjpjb250ZW50X3dyaXRlIiwidWF0Mjpjb250ZW50X3JlYWQiLCJ1YXQ6Y29udGVudF9yZWFkIiwidGhpcmQ6Y29udGVudF9yZWFkIiwic2Vjb25kOmNvbnRlbnRfd3JpdGUiLCJwcm9kdWN0aW9uOmNvbnRlbnRfd3JpdGUiLCJkZXZlbG9wbWVudDpjb250ZW50X3dyaXRlIiwiZGV2ZWxvcG1lbnQ6Y29udGVudF9yZWFkIiwicHJvZHVjdGlvbjpjb250ZW50X3JlYWQiXSwianRpIjoiODJlMzM2NjQtMzY4Ni00ODE4LWI3ZjYtNmJlMTQxNTA2YzllIn0.VORVOeiazSi8h-4ws-I9WZgbeKf5NYgxPInggH9tVy090xZgXynCNr-2CvWnBkWhilhT1G_2nbljDkhd_8fsxL5nZ6P4LuFRdJPtA2HrkWslZNu1gsU45ClRlOBIcF9hjeSHKMgR8sKzwhrBxEGvbmiUkm858fnq0dMpS6Z6_06Yb2NEHI88xQpEYy7QrxU14yaiF0y0fn1I-KiWhXHDKtQol5zauKsryZONk78XykXv2GK7i5Mnt1DlXkIqb3rowjLTdQzAUbzz_8mGMGOup3C8JsMv7T0qcJnCbKWieBY9h-scQ79dBjOe6uKpqR7J8D1G7qw8DHjiu5mHaUbxrA",
                        patchObj
                    );
                    console.log(writeResult);
                    //parse the arguments.
                } catch (e) {
                    console.log(e);
                }
                //ingest.data.properties[item.property].references;
            }
            event.sender.send("issueFixed", "fixed");
        });

        ipcMain.on('resolveIssues', (event) => {
            httpFetcher.getIssues("https://studio.uat.dior.coremedia.cloud", win.webContents.session)
                .then(async json => {
                    let contentIds: Array<string> = json.hits.$Refs;
                    const issueTypes: any = {};
                    if (contentIds.length > 10) {
                        contentIds = contentIds.slice(0, 1);
                    }
                    for (const id of contentIds) {
                        const result = await httpFetcher.getIssueType("https://studio.uat.dior.coremedia.cloud", contentIds[0], win.webContents.session);
                        const propertyObject = result.value.byProperty;
                        Object.keys(propertyObject).forEach((name) => {
                            //console.log("propertyName "+name + " "+Array.isArray(propertyObject[name]));
                            if (Array.isArray(propertyObject[name]) && propertyObject[name].length > 0) {
                                console.log("issue found for property with name " + name);
                                propertyObject[name].forEach((issue: any) => {
                                    if (!issueTypes[issue.code]) {
                                        issueTypes[issue.code] = [];
                                    }

                                    issueTypes[issue.code].push({
                                        contentId: issue.entity.$Ref,
                                        property: issue.property,
                                        arguments: issue.arguments
                                    });
                                })
                            }
                        });
                    }
                    console.log("sending issues via IPC " + JSON.stringify(issueTypes));
                    event.sender.send("issueSend", issueTypes)
                });
        })
        if (process.env.WEBPACK_DEV_SERVER_URL) {
            // Load the url of the dev server if in development mode
            await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
            if (!process.env.IS_TEST) win.webContents.openDevTools()
        } else {
            createProtocol('app')
            // Load the index.html when not in development
            win.loadURL('app://./index.html')
            //win.loadURL("https://studio.production.dior.coremedia.cloud/");
        }

    }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            //await installExtension(VUEJS3_DEVTOOLS)
            await installExtension({
                id: 'ljjemllljcmogpfapbkkighbhhppjdbg',
                electron: '>=1.2.1'
            })
        } catch (e: any) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }
    createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}
