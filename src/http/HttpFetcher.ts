import fetch from 'electron-fetch'
import {Session} from "electron";
import {IssueResponse} from "@/http/IssueResponse";

export default class HttpFetcher {

    public getIssues(host: string, session: Session): Promise<IssueResponse> {
        const url = '/rest/api/content/search?query=&contentType=Content_&folder=content%2F14585&orderBy=freshness+desc%2Cname_lc+asc&includeSubfolders=true&limit=-1&filterQuery=status%3A0+OR+status%3A1+OR+status%3A2%2C%7B%21parent+which%3D%27feederstate%3ASUCCESS%27%7D%2B%28issueSeverity%3A2%29+%2BissueCategories%3Alocalization%2C-documenttype%3AAMAsset+-documenttype%3AAMDocumentAsset+-documenttype%3AAMPictureAsset+-documenttype%3AAMVideoAsset+&_dc=1704787162819';
        const opts: any = {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            useSessionCookies: true,
            session: session,
        };
        return this.executeRequest<IssueResponse>(host, url, opts);
    }

    public getIssueType(host: string, contentId: string, session: Session): Promise<any> {
        const opts: any = {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            useSessionCookies: true,
            session: session,
        };
        return this.executeRequest(host, '/rest/api/content/' + contentId + '/issues', opts);
    }

    public getContent(ingestHost: string, id: string, authToken: string): Promise<any> {
        const contentUrl = "/coremedia/api/ingest/v2/content/";
        console.error(ingestHost + " " + contentUrl.concat(id));
        return this.executeRequest(ingestHost, contentUrl.concat(id), {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + authToken,
            },
        })
    }

    public setContent(ingestHost: string, id: string, authToken: string, body: any) {
        const contentUrl = "/coremedia/api/ingest/v2/content/";
        console.error(ingestHost + " " + contentUrl.concat(id));
        return this.executeRequest(ingestHost, contentUrl.concat(id), {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: {
                'Authorization': 'Bearer ' + authToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
    }

    private executeRequest<T>(host: string, url: string, options: object): Promise<T> {

        return fetch(host.concat(url), options).then(result => {
            return result.json()
        });
    }
}