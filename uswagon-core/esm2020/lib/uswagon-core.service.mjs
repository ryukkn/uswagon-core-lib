import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "@angular/router";
export class UswagonCoreService {
    constructor(http, router) {
        this.http = http;
        this.router = router;
        this.publicForm = {};
        /**
          * Secure form for storing more secure input
          *
          * NOTE: This is the form that should be used when building postObjects
          *
          * @example
          * for(let key in this.API.coreForm){
          *  // process value
          *  console.log(this.API.coreForm[key]);
          * }
          *
        **/
        this.coreForm = {};
        this.liveEvents = {};
    }
    // INITIALIZATION
    /**
       * Initializes the service for the project
       * @param config - configuration that points the service to its appropriate server
       *
       * @example
       * this.API.initialize({
       *  api:environment.api,
       *  apiKey: environment.apiKey,
       *  nodeserver: environment.nodeserver,
       *  server: environment.server,
       *  socket: environment.socket
       * })
       *
     **/
    initialize(config) {
        this.config = config;
        this.socket = new WebSocket(config.socket);
        this.socket.binaryType = 'arraybuffer';
        this.socket.onmessage = (message) => {
            for (const id in this.liveEvents) {
                this.liveEvents[id](message);
            }
        };
    }
    /**
      * Add a new live listener from the server's websocket
      *
      * @param id - Unique identifier for the listeners to avoid collisions
      * @param handler - Websocket messages are passed to this handler
      *
      * @example
      * this.API.addLiveListener('event-1',(message:MessageEvent)=>{
      *  var decodedMessage = new TextDecoder('utf-8').decode(message.data);
      *  const data = JSON.parse(decodedMessage);
      *
      *  OUTPUT:
      *  // same as the json sent from socketSend(data)
      *  // logics are applied here so that messages are only received on specific clients
      *  console.log(data);
      * })
      *
      *
    **/
    addSocketListener(id, handler) {
        if (this.config == undefined) {
            alert('Config must be initialized, try service.initialize(config)');
        }
        this.liveEvents[id] = handler;
    }
    /**
       * Get list of live listeners in the project
       *
       * @example
       * this.API.getListeners();
       *
       * OUTPUT: An alert showing list of listeners
       *
       *
     **/
    getListeners() {
        if (this.config == undefined) {
            alert('Config must be initialized, try service.initialize(config)');
        }
        alert(JSON.stringify(Object.keys(this.liveEvents)));
    }
    /**
       * Sends a message to the websocket
       * @param data - A json object message
       *
       * @example
       * this.API.socketSend({
       *    to: student.id,
       *    message: message,
       * })
       *
       *
     **/
    socketSend(data) {
        if (this.config == undefined) {
            alert('Config must be initialized, try service.initialize(config)');
        }
        this.socket.onopen = () => {
            this.socket.send(JSON.stringify({ key: this.config?.apiKey, data: data }));
        };
    }
    ngOnDestroy() {
        this.socket?.close();
    }
    pgEscapeString(input) {
        if (typeof input !== 'string') {
            throw new TypeError('Input must be a string');
        }
        // Escape single quotes by replacing them with two single quotes
        return input.replace(/'/g, "''");
    }
    /**
       * Builds a CoreForm from user input
       *
       * @param key - A string reference to form key
       * @param value - A string representing the value of a form key
       *
       * @example
       *
       * handleInput(key: string, value: string){
       *  this.API.handleFormValue('email', event.target.value); // key should be initialized using createForm()
       * }
       *
       * OUTPUT:
       * <input (change)='handleInput("email", $event)' >
       *
       *
       *
     **/
    handleFormValue(key, value) {
        this.publicForm[key] = value;
        this.coreForm[key] = this.pgEscapeString(value);
    }
    /**
      * Builds a CoreForm from user input
      *
      * @param key - A string reference to form key
      *
      * @example
      *
      * getInput(key:string){
      *  return this.API.getFormValue(key);
      * }
      *
      * OUTPUT:
      * <div>{{getInput('email')}}</div>
      *
    **/
    getFormValue(key) {
        if (this.publicForm[key] === undefined) {
            alert('Please initialize the form using createForm([form])');
        }
        return this.publicForm[key];
    }
    /**
       * Initialize a CoreForm
       *
       * @param keys - A list of strings representing form keys
       *
       * @example
       * this.API.createForm(['email']);
       *
       * OUTPUT:
       * console.log(this.API.coreForm);
       *
       *
     **/
    createForm(keys) {
        this.publicForm = keys.reduce((prev, curr) => {
            return Object.assign(prev, { [curr]: '' });
        }, {});
        this.coreForm = keys.reduce((prev, curr) => {
            return Object.assign(prev, { [curr]: '' });
        }, {});
    }
    // UTILITIES
    /**
      * Creates a hash from the server for encrypting data
      *
      * @param encrypt - A string to encrypt
      *
      * @returns A string hash or null if an error has occured
      *
      * @example
      * const hash = this.API.hash('ken');
      * if(hash){
      *  console.log(hash);
      * }else{
      *  console.log('ERROR');
      * }
      *
    **/
    async hash(encrypt) {
        const response = await firstValueFrom(this.post('get_hash', { encrypt: encrypt }));
        if (response.success) {
            return response.output;
        }
        else {
            return null;
        }
    }
    /**
       * Creates a unique identifier with the length of 32
       *
       * @returns A random unique 32 string identifier
       *
       * @example
       * const id = this.API.createUniqueID32();
       *
       *
     **/
    createUniqueID32() {
        if (this.config == undefined) {
            alert('Config must be initialized, try service.initialize(config)');
        }
        const timestamp = Date.now().toString(16); // Get current time in hex
        const randomPart = 'xxxxxxxxxxxxxxxx'.replace(/x/g, () => {
            return (Math.random() * 16 | 0).toString(16);
        });
        return timestamp + randomPart.slice(0, 16); // Combine timestamp with random part
    }
    post(method, body) {
        if (this.config == undefined) {
            alert('Config must be initialized, try service.initialize(config)');
        }
        for (var [key, obj] of Object.entries(body)) {
            if (key == 'values') {
                for (var [field, value] of Object.entries(obj)) {
                    obj[field] = value ?? '';
                }
            }
        }
        const headers = new HttpHeaders({
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        });
        const salt = new Date().getTime();
        return this.http.post(this.config?.api + '?' + salt, JSON.stringify(Object.assign({
            API_KEY: this.config?.apiKey,
            Method: method,
        }, body)), { headers });
    }
    // CREATE READ UPDATE AND DELETE HANDLERS
    /**
       * Runs an insert query to the server.
       *
       * @param postObject - An object containing tables, and values for the SQL query.
       * @returns A respose object
       *
       * @example
       * const details.password = this.API.hash(details.password);
       *
       * const data = await this.API.create({
       *   tables: 'admin',
       *   values: {
       *    'email':this.API.coreForm['email'],
       *    'password': this.API.coreForm['password'],
       *  },
       * });
       *
       * if(data.success){
       *  console.log(data.output);
       * }
       *
     **/
    async create(postObject) {
        if (this.config == undefined) {
            alert('Config must be initialized, try service.initialize(config)');
        }
        return await firstValueFrom(this.post('create_entry', {
            'data': JSON.stringify(postObject),
        }));
    }
    /**
       * Runs an read query to the server.
       *
       * @param postObject - An object containing selectors, tables, and conditions for the SQL query.
       * @returns A respose object
       *
       * @example
       * const data = await this.API.read({
       *   selectors: [
       *     'f_admin.ID',
       *     'Username',
       *     'Email',
       *     'COUNT(f_messages.ID) as inbox'
       *   ],
       *   tables: 'f_admin',
       *   conditions: `WHERE email = ${this.API.coreForm['email']}`
       * });
       *
       * if(data.success && data.output.length > 0){
       * // single output
       *  console.log(data.output[0]);
       * // all outtput
       *  for(let row of data.output){
       *    console.log(row);
       *  }
       * }
       *
     **/
    async read(postObject) {
        if (this.config == undefined) {
            alert('Config must be initialized, try service.initialize(config)');
        }
        return await firstValueFrom(this.post('get_entries', {
            'data': JSON.stringify(postObject),
        }));
    }
    /**
      * Runs an update query to the server.
      *
      * @param postObject - An object containing selectors, values ,tables, and conditions for the SQL query.
      * @returns A respose object
      *
      * @example
      * const encrypted = this.API.hash(this.API.coreForm['password']);
      *
      * const data = await this.API.update({
      *   tables: 'f_admin',
      *   values: {
      *    'email':this.API.coreForm['email'],
      *    'password': encrypted,
      *   },
      *   conditions: `WHERE email = ${this.API.coreForm['email']}`
      * });
      *
      * if(data.success){
      *   console.log(data.output);
      * }
      *
    **/
    async update(postObject) {
        if (this.config == undefined) {
            alert('Config must be initialized, try service.initialize(config)');
        }
        return firstValueFrom(this.post('update_entry', {
            'data': JSON.stringify(postObject),
        }));
    }
    /**
       * Runs an delete query to the server.
       *
       * @param postObject - An object containing tables, and conditions for the SQL query.
       * @returns A respose object
       *
       * @example
       * const data = await this.API.delete({
       *   tables: 'f_admin',
       *   conditions: `WHERE email = ${this.API.coreForm['email']}`
       * });
       *
       * if(data.success){
       *   console.log(data.output);
       * }
       *
     **/
    async delete(postObject) {
        if (this.config == undefined) {
            alert('Config must be initialized, try service.initialize(config)');
        }
        return await firstValueFrom(this.post('delete_entry', {
            data: JSON.stringify(postObject),
        }));
    }
    // FILE HANDLERS
    /**
      * Get complete file URL from the server
      *
      * @param file - A string that points to the file.
      * @returns A complete url string from the server
      *
      * @example
      * const url = this.API.getFileURL('files/profile.png');
      *
      * OUTPUT:
      *  https://localhost:8080/files/profile.png
      *
    **/
    getFileURL(file) {
        if (this.config == undefined) {
            alert("Please initialize uswagon core on root app.component.ts");
            return;
        }
        if (file) {
            if (file.includes('http'))
                return file;
            return this.config?.server + '/' + file;
        }
        return file;
    }
    /**
      * Uploads a file to the server
      *
      * @param file - A File to upload
      * @param filename - A string with points to where the file to be stored
      * @param chunkSize - A number representing the number of bytes to upload per chunk
      *
      * @example
      *
      * getUploadProgress(){
      *  return this.API.uploadProgress
      * }
      *
      * await this.API.uploadFile(somefile, '/files/profile.png');
      *
      * OUTPUT:
      * <div>{{getUploadProgress()}}<div> // dynamically updates the progress
    **/
    uploadFile(file, filename, chunkSize = 1024 * 1024) {
        if (this.config == undefined) {
            alert("Please initialize uswagon core on root app.component.ts");
            return new Promise(() => { return null; });
        }
        return new Promise((resolve, reject) => {
            const totalChunks = Math.ceil(file.size / chunkSize);
            let uploadedChunks = 0; // Track uploaded chunks
            const uploadChunk = (chunkIndex) => {
                const start = chunkIndex * chunkSize;
                const end = Math.min(start + chunkSize, file.size);
                const chunk = file.slice(start, end);
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result.split(',')[1];
                    this.http
                        .post(this.config?.nodeserver + '/filehandler-progress', {
                        key: this.config?.apiKey,
                        method: 'create_url',
                        chunk: base64String,
                        fileName: 'files/' + filename,
                        chunkIndex: chunkIndex,
                        totalChunks: totalChunks,
                    })
                        .subscribe({
                        next: () => {
                            uploadedChunks++;
                            this.uploadProgress = Math.round((uploadedChunks / totalChunks) * 100);
                            if (chunkIndex + 1 < totalChunks) {
                                // Upload next chunk
                                uploadChunk(chunkIndex + 1);
                            }
                            else {
                                // console.log(`File upload complete: ${filename}`);
                                this.uploadProgress = undefined;
                                resolve(); // Resolve the promise when the upload is complete
                            }
                        },
                        error: (err) => {
                            // console.error('Error uploading chunk', err);
                            reject(err); // Reject the promise on error
                        },
                    });
                };
                reader.readAsDataURL(chunk);
            };
            // Start uploading the first chunk
            uploadChunk(0);
        });
    }
}
UswagonCoreService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonCoreService, deps: [{ token: i1.HttpClient }, { token: i2.Router }], target: i0.ɵɵFactoryTarget.Injectable });
UswagonCoreService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonCoreService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonCoreService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: function () { return [{ type: i1.HttpClient }, { type: i2.Router }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1jb3JlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWNvcmUvc3JjL2xpYi91c3dhZ29uLWNvcmUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBYSxNQUFNLGVBQWUsQ0FBQztBQUd0RCxPQUFPLEVBQUcsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBS3ZDLE1BQU0sT0FBTyxrQkFBa0I7SUFzQjdCLFlBQ1UsSUFBZ0IsRUFDaEIsTUFBYztRQURkLFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQXRCaEIsZUFBVSxHQUFZLEVBQUUsQ0FBQTtRQUMvQjs7Ozs7Ozs7Ozs7V0FXRztRQUNHLGFBQVEsR0FBWSxFQUFFLENBQUE7UUFJckIsZUFBVSxHQUFxRCxFQUFFLENBQUM7SUFNdEUsQ0FBQztJQUVMLGlCQUFpQjtJQUNqQjs7Ozs7Ozs7Ozs7OztRQWFJO0lBQ0osVUFBVSxDQUFDLE1BQWlCO1FBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLGFBQWEsQ0FBQztRQUN2QyxJQUFJLENBQUMsTUFBTyxDQUFDLFNBQVMsR0FBRyxDQUFDLE9BQU8sRUFBQyxFQUFFO1lBQ2xDLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDOUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNoQztRQUNILENBQUMsQ0FBQTtJQUNILENBQUM7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QUMsQ0FBQztnQkFDUCxDQUFDLENBQUM7Z0JBRUYsTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUM7WUFFRixrQ0FBa0M7WUFDbEMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7Z0hBbGZVLGtCQUFrQjtvSEFBbEIsa0JBQWtCLGNBRmpCLE1BQU07NEZBRVAsa0JBQWtCO2tCQUg5QixVQUFVO21CQUFDO29CQUNWLFVBQVUsRUFBRSxNQUFNO2lCQUNuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBDbGllbnQsIEh0dHBIZWFkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgQ29yZUNvbmZpZywgQ29yZUNyZWF0ZU9iamVjdCwgQ29yZURlbGV0ZU9iamVjdCwgQ29yZUZvcm0sIENvcmVSZWFkT2JqZWN0LCBDb3JlUmVzcG9uc2UsIENvcmVVcGRhdGVPYmplY3QgfSBmcm9tICcuL3R5cGVzL3Vzd2Fnb24tY29yZS50eXBlcyc7XG5pbXBvcnQgeyAgZmlyc3RWYWx1ZUZyb20gfSBmcm9tICdyeGpzJztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgVXN3YWdvbkNvcmVTZXJ2aWNlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHVibGljIHVwbG9hZFByb2dyZXNzPzpudW1iZXI7XG4gIHByaXZhdGUgcHVibGljRm9ybTpDb3JlRm9ybSA9IHt9XG4gICAvKipcbiAgICAgKiBTZWN1cmUgZm9ybSBmb3Igc3RvcmluZyBtb3JlIHNlY3VyZSBpbnB1dFxuICAgICAqIFxuICAgICAqIE5PVEU6IFRoaXMgaXMgdGhlIGZvcm0gdGhhdCBzaG91bGQgYmUgdXNlZCB3aGVuIGJ1aWxkaW5nIHBvc3RPYmplY3RzXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBmb3IobGV0IGtleSBpbiB0aGlzLkFQSS5jb3JlRm9ybSl7XG4gICAgICogIC8vIHByb2Nlc3MgdmFsdWVcbiAgICAgKiAgY29uc29sZS5sb2codGhpcy5BUEkuY29yZUZvcm1ba2V5XSk7XG4gICAgICogfVxuICAgICAqIFxuICAgKiovXG4gIHB1YmxpYyBjb3JlRm9ybTpDb3JlRm9ybSA9IHt9XG4gIFxuICBwcml2YXRlIHNvY2tldD86IFdlYlNvY2tldDtcbiAgcHJpdmF0ZSBjb25maWc/OiBDb3JlQ29uZmlnO1xuICBwcml2YXRlIGxpdmVFdmVudHM6e1trZXk6IHN0cmluZ106IChtZXNzYWdlOiBNZXNzYWdlRXZlbnQpID0+IHZvaWQgfSA9IHt9O1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXG4gICkgeyB9XG5cbiAgLy8gSU5JVElBTElaQVRJT05cbiAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIHNlcnZpY2UgZm9yIHRoZSBwcm9qZWN0XG4gICAgICogQHBhcmFtIGNvbmZpZyAtIGNvbmZpZ3VyYXRpb24gdGhhdCBwb2ludHMgdGhlIHNlcnZpY2UgdG8gaXRzIGFwcHJvcHJpYXRlIHNlcnZlclxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogdGhpcy5BUEkuaW5pdGlhbGl6ZSh7XG4gICAgICogIGFwaTplbnZpcm9ubWVudC5hcGksXG4gICAgICogIGFwaUtleTogZW52aXJvbm1lbnQuYXBpS2V5LFxuICAgICAqICBub2Rlc2VydmVyOiBlbnZpcm9ubWVudC5ub2Rlc2VydmVyLFxuICAgICAqICBzZXJ2ZXI6IGVudmlyb25tZW50LnNlcnZlcixcbiAgICAgKiAgc29ja2V0OiBlbnZpcm9ubWVudC5zb2NrZXRcbiAgICAgKiB9KVxuICAgICAqIFxuICAgKiovXG4gIGluaXRpYWxpemUoY29uZmlnOkNvcmVDb25maWcpe1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldChjb25maWcuc29ja2V0KTtcbiAgICB0aGlzLnNvY2tldC5iaW5hcnlUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgICB0aGlzLnNvY2tldCEub25tZXNzYWdlID0gKG1lc3NhZ2UpPT57XG4gICAgICBmb3IgKGNvbnN0IGlkIGluIHRoaXMubGl2ZUV2ZW50cykge1xuICAgICAgICAgIHRoaXMubGl2ZUV2ZW50c1tpZF0obWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgIC8qKlxuICAgICAqIEFkZCBhIG5ldyBsaXZlIGxpc3RlbmVyIGZyb20gdGhlIHNlcnZlcidzIHdlYnNvY2tldFxuICAgICAqIFxuICAgICAqIEBwYXJhbSBpZCAtIFVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGUgbGlzdGVuZXJzIHRvIGF2b2lkIGNvbGxpc2lvbnNcbiAgICAgKiBAcGFyYW0gaGFuZGxlciAtIFdlYnNvY2tldCBtZXNzYWdlcyBhcmUgcGFzc2VkIHRvIHRoaXMgaGFuZGxlclxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0aGlzLkFQSS5hZGRMaXZlTGlzdGVuZXIoJ2V2ZW50LTEnLChtZXNzYWdlOk1lc3NhZ2VFdmVudCk9PntcbiAgICAgKiAgdmFyIGRlY29kZWRNZXNzYWdlID0gbmV3IFRleHREZWNvZGVyKCd1dGYtOCcpLmRlY29kZShtZXNzYWdlLmRhdGEpO1xuICAgICAqICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShkZWNvZGVkTWVzc2FnZSk7XG4gICAgICogXG4gICAgICogIE9VVFBVVDpcbiAgICAgKiAgLy8gc2FtZSBhcyB0aGUganNvbiBzZW50IGZyb20gc29ja2V0U2VuZChkYXRhKVxuICAgICAqICAvLyBsb2dpY3MgYXJlIGFwcGxpZWQgaGVyZSBzbyB0aGF0IG1lc3NhZ2VzIGFyZSBvbmx5IHJlY2VpdmVkIG9uIHNwZWNpZmljIGNsaWVudHNcbiAgICAgKiAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICogfSlcbiAgICAgKiBcbiAgICAgKiBcbiAgICoqL1xuICBhZGRTb2NrZXRMaXN0ZW5lciggaWQ6c3RyaW5nLGhhbmRsZXI6KG1lc3NhZ2U6IE1lc3NhZ2VFdmVudCk9PnZvaWQpIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgdGhpcy5saXZlRXZlbnRzW2lkXT0gaGFuZGxlcjtcbiAgfVxuICAvKipcbiAgICAgKiBHZXQgbGlzdCBvZiBsaXZlIGxpc3RlbmVycyBpbiB0aGUgcHJvamVjdFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0aGlzLkFQSS5nZXRMaXN0ZW5lcnMoKTtcbiAgICAgKiBcbiAgICAgKiBPVVRQVVQ6IEFuIGFsZXJ0IHNob3dpbmcgbGlzdCBvZiBsaXN0ZW5lcnNcbiAgICAgKiBcbiAgICAgKiBcbiAgICoqL1xuICBnZXRMaXN0ZW5lcnMoKSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIGFsZXJ0KEpTT04uc3RyaW5naWZ5KE9iamVjdC5rZXlzKHRoaXMubGl2ZUV2ZW50cykpKTtcbiAgfVxuICAvKipcbiAgICAgKiBTZW5kcyBhIG1lc3NhZ2UgdG8gdGhlIHdlYnNvY2tldFxuICAgICAqIEBwYXJhbSBkYXRhIC0gQSBqc29uIG9iamVjdCBtZXNzYWdlXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLnNvY2tldFNlbmQoe1xuICAgICAqICAgIHRvOiBzdHVkZW50LmlkLFxuICAgICAqICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICogfSlcbiAgICAgKiBcbiAgICAgKiBcbiAgICoqL1xuICBzb2NrZXRTZW5kKGRhdGE6IG9iamVjdCkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICB0aGlzLnNvY2tldCEub25vcGVuID0gKCk9PntcbiAgICAgIHRoaXMuc29ja2V0IS5zZW5kKFxuICAgICAgICBKU09OLnN0cmluZ2lmeSh7IGtleTogdGhpcy5jb25maWc/LmFwaUtleSwgZGF0YTogZGF0YSB9KVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuc29ja2V0Py5jbG9zZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBwZ0VzY2FwZVN0cmluZyhpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodHlwZW9mIGlucHV0ICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnB1dCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgfSBcbiAgICAvLyBFc2NhcGUgc2luZ2xlIHF1b3RlcyBieSByZXBsYWNpbmcgdGhlbSB3aXRoIHR3byBzaW5nbGUgcXVvdGVzXG4gICAgcmV0dXJuIGlucHV0LnJlcGxhY2UoLycvZywgXCInJ1wiKTtcbiAgfVxuXG4gIC8qKlxuICAgICAqIEJ1aWxkcyBhIENvcmVGb3JtIGZyb20gdXNlciBpbnB1dFxuICAgICAqXG4gICAgICogQHBhcmFtIGtleSAtIEEgc3RyaW5nIHJlZmVyZW5jZSB0byBmb3JtIGtleVxuICAgICAqIEBwYXJhbSB2YWx1ZSAtIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgYSBmb3JtIGtleVxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogXG4gICAgICogaGFuZGxlSW5wdXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpe1xuICAgICAqICB0aGlzLkFQSS5oYW5kbGVGb3JtVmFsdWUoJ2VtYWlsJywgZXZlbnQudGFyZ2V0LnZhbHVlKTsgLy8ga2V5IHNob3VsZCBiZSBpbml0aWFsaXplZCB1c2luZyBjcmVhdGVGb3JtKClcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqIDxpbnB1dCAoY2hhbmdlKT0naGFuZGxlSW5wdXQoXCJlbWFpbFwiLCAkZXZlbnQpJyA+IFxuICAgICAqXG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgaGFuZGxlRm9ybVZhbHVlKGtleTpzdHJpbmcsIHZhbHVlOnN0cmluZyl7XG4gICAgdGhpcy5wdWJsaWNGb3JtW2tleV0gPSB2YWx1ZTsgXG4gICAgdGhpcy5jb3JlRm9ybVtrZXldID0gdGhpcy5wZ0VzY2FwZVN0cmluZyh2YWx1ZSk7XG4gIH1cbiAgIC8qKlxuICAgICAqIEJ1aWxkcyBhIENvcmVGb3JtIGZyb20gdXNlciBpbnB1dFxuICAgICAqXG4gICAgICogQHBhcmFtIGtleSAtIEEgc3RyaW5nIHJlZmVyZW5jZSB0byBmb3JtIGtleVxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogXG4gICAgICogZ2V0SW5wdXQoa2V5OnN0cmluZyl7XG4gICAgICogIHJldHVybiB0aGlzLkFQSS5nZXRGb3JtVmFsdWUoa2V5KTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqIDxkaXY+e3tnZXRJbnB1dCgnZW1haWwnKX19PC9kaXY+XG4gICAgICogXG4gICAqKi9cbiAgIGdldEZvcm1WYWx1ZShrZXk6c3RyaW5nKXtcbiAgICBpZih0aGlzLnB1YmxpY0Zvcm1ba2V5XSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdQbGVhc2UgaW5pdGlhbGl6ZSB0aGUgZm9ybSB1c2luZyBjcmVhdGVGb3JtKFtmb3JtXSknKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHVibGljRm9ybVtrZXldO1xuICB9XG5cbiAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBhIENvcmVGb3JtXG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5cyAtIEEgbGlzdCBvZiBzdHJpbmdzIHJlcHJlc2VudGluZyBmb3JtIGtleXNcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLmNyZWF0ZUZvcm0oWydlbWFpbCddKTtcbiAgICAgKiAgXG4gICAgICogT1VUUFVUOlxuICAgICAqIGNvbnNvbGUubG9nKHRoaXMuQVBJLmNvcmVGb3JtKTsgXG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgY3JlYXRlRm9ybShrZXlzOnN0cmluZ1tdKXtcbiAgICB0aGlzLnB1YmxpY0Zvcm0gPSBrZXlzLnJlZHVjZSgocHJldjphbnksY3VycjphbnkpPT57XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihwcmV2LCB7W2N1cnJdOicnfSlcbiAgICB9LHt9KVxuICAgIHRoaXMuY29yZUZvcm0gPSBrZXlzLnJlZHVjZSgocHJldjphbnksY3VycjphbnkpPT57XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihwcmV2LCB7W2N1cnJdOicnfSlcbiAgICB9LHt9KVxuICB9XG5cbiAgLy8gVVRJTElUSUVTXG4gICAvKipcbiAgICAgKiBDcmVhdGVzIGEgaGFzaCBmcm9tIHRoZSBzZXJ2ZXIgZm9yIGVuY3J5cHRpbmcgZGF0YVxuICAgICAqXG4gICAgICogQHBhcmFtIGVuY3J5cHQgLSBBIHN0cmluZyB0byBlbmNyeXB0XG4gICAgICogXG4gICAgICogQHJldHVybnMgQSBzdHJpbmcgaGFzaCBvciBudWxsIGlmIGFuIGVycm9yIGhhcyBvY2N1cmVkXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGhhc2ggPSB0aGlzLkFQSS5oYXNoKCdrZW4nKTtcbiAgICAgKiBpZihoYXNoKXtcbiAgICAgKiAgY29uc29sZS5sb2coaGFzaCk7XG4gICAgICogfWVsc2V7XG4gICAgICogIGNvbnNvbGUubG9nKCdFUlJPUicpO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICoqL1xuICBhc3luYyBoYXNoKGVuY3J5cHQ6c3RyaW5nKXtcbiAgICBjb25zdCByZXNwb25zZSA9ICBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLnBvc3QoJ2dldF9oYXNoJywge2VuY3J5cHQ6IGVuY3J5cHR9KSlcbiAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgIHJldHVybiByZXNwb25zZS5vdXRwdXQ7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHVuaXF1ZSBpZGVudGlmaWVyIHdpdGggdGhlIGxlbmd0aCBvZiAzMlxuICAgICAqXG4gICAgICogQHJldHVybnMgQSByYW5kb20gdW5pcXVlIDMyIHN0cmluZyBpZGVudGlmaWVyXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGlkID0gdGhpcy5BUEkuY3JlYXRlVW5pcXVlSUQzMigpO1xuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIGNyZWF0ZVVuaXF1ZUlEMzIoKSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIGNvbnN0IHRpbWVzdGFtcCA9IERhdGUubm93KCkudG9TdHJpbmcoMTYpOyAvLyBHZXQgY3VycmVudCB0aW1lIGluIGhleFxuICAgICAgY29uc3QgcmFuZG9tUGFydCA9ICd4eHh4eHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC94L2csICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAxNiB8IDApLnRvU3RyaW5nKDE2KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRpbWVzdGFtcCArIHJhbmRvbVBhcnQuc2xpY2UoMCwgMTYpOyAvLyBDb21iaW5lIHRpbWVzdGFtcCB3aXRoIHJhbmRvbSBwYXJ0XG4gIH1cblxuICBwcml2YXRlIHBvc3QobWV0aG9kOiBzdHJpbmcsIGJvZHk6IHt9KSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIGZvciAodmFyIFtrZXksIG9ial0gb2YgT2JqZWN0LmVudHJpZXM8YW55Pihib2R5KSkge1xuICAgICAgaWYgKGtleSA9PSAndmFsdWVzJykge1xuICAgICAgICBmb3IgKHZhciBbZmllbGQsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgICAgICAgb2JqW2ZpZWxkXSA9IHZhbHVlID8/ICcnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoe1xuICAgICAgJ1gtUmVxdWVzdGVkLVdpdGgnOiAnWE1MSHR0cFJlcXVlc3QnLFxuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICB9KTtcbiAgICBjb25zdCBzYWx0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0PGFueT4oXG4gICAgICB0aGlzLmNvbmZpZz8uYXBpICsgJz8nICsgc2FsdCxcbiAgICAgIEpTT04uc3RyaW5naWZ5KFxuICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIEFQSV9LRVk6IHRoaXMuY29uZmlnPy5hcGlLZXksXG4gICAgICAgICAgICBNZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGJvZHlcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIHsgaGVhZGVycyB9XG4gICAgKTtcbiAgfVxuXG4gIFxuICAvLyBDUkVBVEUgUkVBRCBVUERBVEUgQU5EIERFTEVURSBIQU5ETEVSU1xuXG4gIC8qKlxuICAgICAqIFJ1bnMgYW4gaW5zZXJ0IHF1ZXJ5IHRvIHRoZSBzZXJ2ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcG9zdE9iamVjdCAtIEFuIG9iamVjdCBjb250YWluaW5nIHRhYmxlcywgYW5kIHZhbHVlcyBmb3IgdGhlIFNRTCBxdWVyeS5cbiAgICAgKiBAcmV0dXJucyBBIHJlc3Bvc2Ugb2JqZWN0IFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBkZXRhaWxzLnBhc3N3b3JkID0gdGhpcy5BUEkuaGFzaChkZXRhaWxzLnBhc3N3b3JkKTtcbiAgICAgKiBcbiAgICAgKiBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5BUEkuY3JlYXRlKHtcbiAgICAgKiAgIHRhYmxlczogJ2FkbWluJyxcbiAgICAgKiAgIHZhbHVlczoge1xuICAgICAqICAgICdlbWFpbCc6dGhpcy5BUEkuY29yZUZvcm1bJ2VtYWlsJ10sXG4gICAgICogICAgJ3Bhc3N3b3JkJzogdGhpcy5BUEkuY29yZUZvcm1bJ3Bhc3N3b3JkJ10sIFxuICAgICAqICB9LFxuICAgICAqIH0pO1xuICAgICAqIFxuICAgICAqIGlmKGRhdGEuc3VjY2Vzcyl7XG4gICAgICogIGNvbnNvbGUubG9nKGRhdGEub3V0cHV0KTtcbiAgICAgKiB9XG4gICAgICogXG4gICAqKi9cbiAgYXN5bmMgY3JlYXRlKHBvc3RPYmplY3Q6Q29yZUNyZWF0ZU9iamVjdCk6UHJvbWlzZTxDb3JlUmVzcG9uc2U+e1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICByZXR1cm4gIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMucG9zdCgnY3JlYXRlX2VudHJ5Jywge1xuICAgICAgJ2RhdGEnOiBKU09OLnN0cmluZ2lmeShwb3N0T2JqZWN0KSxcbiAgICB9KSk7XG4gIH1cblxuICAvKipcbiAgICAgKiBSdW5zIGFuIHJlYWQgcXVlcnkgdG8gdGhlIHNlcnZlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwb3N0T2JqZWN0IC0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgc2VsZWN0b3JzLCB0YWJsZXMsIGFuZCBjb25kaXRpb25zIGZvciB0aGUgU1FMIHF1ZXJ5LlxuICAgICAqIEByZXR1cm5zIEEgcmVzcG9zZSBvYmplY3QgXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLkFQSS5yZWFkKHtcbiAgICAgKiAgIHNlbGVjdG9yczogW1xuICAgICAqICAgICAnZl9hZG1pbi5JRCcsXG4gICAgICogICAgICdVc2VybmFtZScsXG4gICAgICogICAgICdFbWFpbCcsXG4gICAgICogICAgICdDT1VOVChmX21lc3NhZ2VzLklEKSBhcyBpbmJveCdcbiAgICAgKiAgIF0sXG4gICAgICogICB0YWJsZXM6ICdmX2FkbWluJyxcbiAgICAgKiAgIGNvbmRpdGlvbnM6IGBXSEVSRSBlbWFpbCA9ICR7dGhpcy5BUEkuY29yZUZvcm1bJ2VtYWlsJ119YFxuICAgICAqIH0pO1xuICAgICAqIFxuICAgICAqIGlmKGRhdGEuc3VjY2VzcyAmJiBkYXRhLm91dHB1dC5sZW5ndGggPiAwKXtcbiAgICAgKiAvLyBzaW5nbGUgb3V0cHV0XG4gICAgICogIGNvbnNvbGUubG9nKGRhdGEub3V0cHV0WzBdKTtcbiAgICAgKiAvLyBhbGwgb3V0dHB1dFxuICAgICAqICBmb3IobGV0IHJvdyBvZiBkYXRhLm91dHB1dCl7XG4gICAgICogICAgY29uc29sZS5sb2cocm93KTtcbiAgICAgKiAgfVxuICAgICAqIH1cbiAgICAgKiBcbiAgICoqL1xuICBhc3luYyByZWFkKHBvc3RPYmplY3Q6Q29yZVJlYWRPYmplY3QpOlByb21pc2U8Q29yZVJlc3BvbnNlPntcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMucG9zdCgnZ2V0X2VudHJpZXMnLCB7XG4gICAgICAnZGF0YSc6IEpTT04uc3RyaW5naWZ5KHBvc3RPYmplY3QpLFxuICAgIH0pKTtcbiAgfVxuICAgLyoqXG4gICAgICogUnVucyBhbiB1cGRhdGUgcXVlcnkgdG8gdGhlIHNlcnZlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwb3N0T2JqZWN0IC0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgc2VsZWN0b3JzLCB2YWx1ZXMgLHRhYmxlcywgYW5kIGNvbmRpdGlvbnMgZm9yIHRoZSBTUUwgcXVlcnkuXG4gICAgICogQHJldHVybnMgQSByZXNwb3NlIG9iamVjdCBcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZW5jcnlwdGVkID0gdGhpcy5BUEkuaGFzaCh0aGlzLkFQSS5jb3JlRm9ybVsncGFzc3dvcmQnXSk7XG4gICAgICogXG4gICAgICogY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuQVBJLnVwZGF0ZSh7XG4gICAgICogICB0YWJsZXM6ICdmX2FkbWluJyxcbiAgICAgKiAgIHZhbHVlczoge1xuICAgICAqICAgICdlbWFpbCc6dGhpcy5BUEkuY29yZUZvcm1bJ2VtYWlsJ10sXG4gICAgICogICAgJ3Bhc3N3b3JkJzogZW5jcnlwdGVkLCBcbiAgICAgKiAgIH0sXG4gICAgICogICBjb25kaXRpb25zOiBgV0hFUkUgZW1haWwgPSAke3RoaXMuQVBJLmNvcmVGb3JtWydlbWFpbCddfWBcbiAgICAgKiB9KTtcbiAgICAgKiBcbiAgICAgKiBpZihkYXRhLnN1Y2Nlc3Mpe1xuICAgICAqICAgY29uc29sZS5sb2coZGF0YS5vdXRwdXQpO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICoqL1xuICBhc3luYyB1cGRhdGUocG9zdE9iamVjdDpDb3JlVXBkYXRlT2JqZWN0KTpQcm9taXNlPENvcmVSZXNwb25zZT57XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgcmV0dXJuIGZpcnN0VmFsdWVGcm9tKCB0aGlzLnBvc3QoJ3VwZGF0ZV9lbnRyeScsIHtcbiAgICAnZGF0YSc6IEpTT04uc3RyaW5naWZ5KHBvc3RPYmplY3QpLFxuICB9KSk7XG4gIH1cblxuICAvKipcbiAgICAgKiBSdW5zIGFuIGRlbGV0ZSBxdWVyeSB0byB0aGUgc2VydmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHBvc3RPYmplY3QgLSBBbiBvYmplY3QgY29udGFpbmluZyB0YWJsZXMsIGFuZCBjb25kaXRpb25zIGZvciB0aGUgU1FMIHF1ZXJ5LlxuICAgICAqIEByZXR1cm5zIEEgcmVzcG9zZSBvYmplY3QgXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLkFQSS5kZWxldGUoe1xuICAgICAqICAgdGFibGVzOiAnZl9hZG1pbicsXG4gICAgICogICBjb25kaXRpb25zOiBgV0hFUkUgZW1haWwgPSAke3RoaXMuQVBJLmNvcmVGb3JtWydlbWFpbCddfWBcbiAgICAgKiB9KTtcbiAgICAgKiBcbiAgICAgKiBpZihkYXRhLnN1Y2Nlc3Mpe1xuICAgICAqICAgY29uc29sZS5sb2coZGF0YS5vdXRwdXQpO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICoqL1xuICBhc3luYyBkZWxldGUocG9zdE9iamVjdDpDb3JlRGVsZXRlT2JqZWN0KTpQcm9taXNlPENvcmVSZXNwb25zZT57XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLnBvc3QoJ2RlbGV0ZV9lbnRyeScsIHtcbiAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHBvc3RPYmplY3QpLFxuICAgIH0pKVxuICB9XG5cbiAgLy8gRklMRSBIQU5ETEVSU1xuXG4gICAvKipcbiAgICAgKiBHZXQgY29tcGxldGUgZmlsZSBVUkwgZnJvbSB0aGUgc2VydmVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZmlsZSAtIEEgc3RyaW5nIHRoYXQgcG9pbnRzIHRvIHRoZSBmaWxlLlxuICAgICAqIEByZXR1cm5zIEEgY29tcGxldGUgdXJsIHN0cmluZyBmcm9tIHRoZSBzZXJ2ZXIgXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IHVybCA9IHRoaXMuQVBJLmdldEZpbGVVUkwoJ2ZpbGVzL3Byb2ZpbGUucG5nJyk7XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqICBodHRwczovL2xvY2FsaG9zdDo4MDgwL2ZpbGVzL3Byb2ZpbGUucG5nXG4gICAgICogXG4gICAqKi9cbiAgZ2V0RmlsZVVSTChmaWxlOiBzdHJpbmcpOnN0cmluZ3x1bmRlZmluZWQge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydChcIlBsZWFzZSBpbml0aWFsaXplIHVzd2Fnb24gY29yZSBvbiByb290IGFwcC5jb21wb25lbnQudHNcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChmaWxlKSB7XG4gICAgICBpZiAoZmlsZS5pbmNsdWRlcygnaHR0cCcpKSByZXR1cm4gZmlsZTtcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZz8uc2VydmVyICsgJy8nICsgZmlsZSA7XG4gICAgfVxuICAgIHJldHVybiBmaWxlO1xuICB9XG5cbiAgIC8qKlxuICAgICAqIFVwbG9hZHMgYSBmaWxlIHRvIHRoZSBzZXJ2ZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSBmaWxlIC0gQSBGaWxlIHRvIHVwbG9hZFxuICAgICAqIEBwYXJhbSBmaWxlbmFtZSAtIEEgc3RyaW5nIHdpdGggcG9pbnRzIHRvIHdoZXJlIHRoZSBmaWxlIHRvIGJlIHN0b3JlZCBcbiAgICAgKiBAcGFyYW0gY2h1bmtTaXplIC0gQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBudW1iZXIgb2YgYnl0ZXMgdG8gdXBsb2FkIHBlciBjaHVua1xuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBcbiAgICAgKiBnZXRVcGxvYWRQcm9ncmVzcygpe1xuICAgICAqICByZXR1cm4gdGhpcy5BUEkudXBsb2FkUHJvZ3Jlc3NcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogYXdhaXQgdGhpcy5BUEkudXBsb2FkRmlsZShzb21lZmlsZSwgJy9maWxlcy9wcm9maWxlLnBuZycpO1xuICAgICAqIFxuICAgICAqIE9VVFBVVDpcbiAgICAgKiA8ZGl2Pnt7Z2V0VXBsb2FkUHJvZ3Jlc3MoKX19PGRpdj4gLy8gZHluYW1pY2FsbHkgdXBkYXRlcyB0aGUgcHJvZ3Jlc3NcbiAgICoqL1xuICB1cGxvYWRGaWxlKGZpbGU6IEZpbGUsIGZpbGVuYW1lOiBzdHJpbmcsIGNodW5rU2l6ZTogbnVtYmVyID0gMTAyNCAqIDEwMjQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoXCJQbGVhc2UgaW5pdGlhbGl6ZSB1c3dhZ29uIGNvcmUgb24gcm9vdCBhcHAuY29tcG9uZW50LnRzXCIpO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpPT57cmV0dXJuIG51bGx9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHRvdGFsQ2h1bmtzID0gTWF0aC5jZWlsKGZpbGUuc2l6ZSAvIGNodW5rU2l6ZSk7XG4gICAgICBsZXQgdXBsb2FkZWRDaHVua3MgPSAwOyAvLyBUcmFjayB1cGxvYWRlZCBjaHVua3NcblxuICAgICAgY29uc3QgdXBsb2FkQ2h1bmsgPSAoY2h1bmtJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gY2h1bmtJbmRleCAqIGNodW5rU2l6ZTtcbiAgICAgICAgY29uc3QgZW5kID0gTWF0aC5taW4oc3RhcnQgKyBjaHVua1NpemUsIGZpbGUuc2l6ZSk7XG4gICAgICAgIGNvbnN0IGNodW5rID0gZmlsZS5zbGljZShzdGFydCwgZW5kKTtcblxuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICByZWFkZXIub25sb2FkZW5kID0gKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGJhc2U2NFN0cmluZyA9IChyZWFkZXIucmVzdWx0IGFzIHN0cmluZykuc3BsaXQoJywnKVsxXTtcblxuICAgICAgICAgIHRoaXMuaHR0cFxuICAgICAgICAgICAgLnBvc3QodGhpcy5jb25maWc/Lm5vZGVzZXJ2ZXIgKyAnL2ZpbGVoYW5kbGVyLXByb2dyZXNzJywge1xuICAgICAgICAgICAgICBrZXk6IHRoaXMuY29uZmlnPy5hcGlLZXksXG4gICAgICAgICAgICAgIG1ldGhvZDogJ2NyZWF0ZV91cmwnLFxuICAgICAgICAgICAgICBjaHVuazogYmFzZTY0U3RyaW5nLFxuICAgICAgICAgICAgICBmaWxlTmFtZTogJ2ZpbGVzLycgKyBmaWxlbmFtZSxcbiAgICAgICAgICAgICAgY2h1bmtJbmRleDogY2h1bmtJbmRleCxcbiAgICAgICAgICAgICAgdG90YWxDaHVua3M6IHRvdGFsQ2h1bmtzLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoe1xuICAgICAgICAgICAgICBuZXh0OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdXBsb2FkZWRDaHVua3MrKztcbiAgICAgICAgICAgICAgICB0aGlzLnVwbG9hZFByb2dyZXNzID0gTWF0aC5yb3VuZCgodXBsb2FkZWRDaHVua3MgLyB0b3RhbENodW5rcykgKiAxMDApO1xuICAgICAgICAgICAgICAgIGlmIChjaHVua0luZGV4ICsgMSA8IHRvdGFsQ2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgICAvLyBVcGxvYWQgbmV4dCBjaHVua1xuICAgICAgICAgICAgICAgICAgdXBsb2FkQ2h1bmsoY2h1bmtJbmRleCArIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgRmlsZSB1cGxvYWQgY29tcGxldGU6ICR7ZmlsZW5hbWV9YCk7XG4gICAgICAgICAgICAgICAgICB0aGlzLnVwbG9hZFByb2dyZXNzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpOyAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIHdoZW4gdGhlIHVwbG9hZCBpcyBjb21wbGV0ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZXJyb3I6IChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmVycm9yKCdFcnJvciB1cGxvYWRpbmcgY2h1bmsnLCBlcnIpO1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpOyAvLyBSZWplY3QgdGhlIHByb21pc2Ugb24gZXJyb3JcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGNodW5rKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFN0YXJ0IHVwbG9hZGluZyB0aGUgZmlyc3QgY2h1bmtcbiAgICAgIHVwbG9hZENodW5rKDApO1xuICAgIH0pO1xuICB9XG59XG4iXX0=