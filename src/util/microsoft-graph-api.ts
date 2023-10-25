import { AuthenticationResult, ConfidentialClientApplication } from "@azure/msal-node";
import { THttpMethods } from "../types/custom-express-types";
type TMSAPIVersion = "1.0" | "beta";

export interface IGraphEmailAttachments {
  "@odata.type": string;
  name: string;
  contentBytes: Buffer | string;
  contentType: string;
}

export default class MicrosoftGraphAPI {
  public tenant: string;
  private CLIENT_ID: string;
  private CLIENT_SECRET: string;
  private token: AuthenticationResult | null;

  static async build(tenant: string, CLIENT_ID: string, CLIENT_SECRET: string) {
    const graph = new MicrosoftGraphAPI(tenant, CLIENT_ID, CLIENT_SECRET);
    await graph.setApplicationToken();
    return graph;
  }

  constructor(tenant: string, CLIENT_ID: string, CLIENT_SECRET: string) {
    this.tenant = tenant;
    this.CLIENT_ID = CLIENT_ID;
    this.CLIENT_SECRET = CLIENT_SECRET;
  }

  /**
   * This function takes a route and a api version
   * @param {string} route : The route you would like to use e.g. /drives/driveId/items/itemId etc
   * @param {"1.0" | "beta"} apiVersion Optional : The API version of the graph you would like to use. Default 1.0
   * @returns : URL string for the graph
   */
  private graphRoute(route: string, apiVersion: TMSAPIVersion = "1.0"): string {
    if (route.startsWith("/")) route = route.substring(1);
    return `https://graph.microsoft.com/v${apiVersion}/${route}`;
  }

  private assembleToRecipientsObject(arr: string[]) {
    let emails = [];
    if (!Array.isArray(arr)) {
      emails = [arr];
    } else {
      emails = arr;
    }
    const init = [];
    for (const emailAdd of emails) {
      init.push({
        emailAddress: {
          address: emailAdd
        }
      });
    }
    return init;
  }

  public async sendEmail(
    from: string,
    toArr: string[],
    subject: string,
    message: string,
    messageType: "Text" | "HTML" = "Text",
    bcc: boolean = true,
    attachments: IGraphEmailAttachments[] = []
  ): Promise<void> {
    try {
      const route = `/users/${from}/SendMail`;
      const toRecipients = !!bcc
        ? { bccRecipients: this.assembleToRecipientsObject(toArr) }
        : { toRecipients: this.assembleToRecipientsObject(toArr) };

      const body = JSON.stringify({
        message: {
          ...toRecipients,
          subject: subject,
          body: {
            contentType: messageType,
            content: message
          },
          attachments
        }
      });
      await this.graphRequest(route, "POST", body, "application/json");
    } catch (error) {
      throw error;
    }
  }

  private async setApplicationToken() {
    const authority = "https://login.microsoftonline.com/" + this.tenant + ".onmicrosoft.com";
    const config = {
      auth: {
        authority,
        clientId: this.CLIENT_ID,
        clientSecret: this.CLIENT_SECRET
      }
    };
    const clientApp = new ConfidentialClientApplication(config);
    this.token = await clientApp.acquireTokenByClientCredential({
      scopes: ["https://graph.microsoft.com/.default"],
      authority
    });
  }

  private async graphRequest(route: string, method: THttpMethods, body: any = null, contentType: string | null = null): Promise<any> {
    const headers: any = {
      Authorization: this.token?.accessToken ?? "",
      Accept: "application/json"
    };
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    try {
      const url = this.graphRoute(route);
      const res = await fetch(url, {
        method: method,
        headers: headers,
        body: body
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const bCheck = await res.text();
      if (bCheck) {
        const contentType: string = res.headers?.get("Content-Type")?.toLowerCase() ?? "";
        if (!contentType) {
          return;
        }
        if (contentType.startsWith("text")) {
          return bCheck;
        }
        if (contentType.includes("json")) {
          return JSON.parse(bCheck);
        }
        if (contentType.includes("csv")) {
          return bCheck;
        } else return bCheck;
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
