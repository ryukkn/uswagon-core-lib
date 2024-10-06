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
            var decodedMessage = new TextDecoder('utf-8').decode(message.data);
            const socketData = JSON.parse(decodedMessage);
            if (socketData.app != config.app)
                return;
            for (const id in this.liveEvents) {
                this.liveEvents[id](socketData.data);
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
      * this.API.addLiveListener('event-1',(message:{[key:string]:any})=>{
      *  OUTPUT:
      *  // same as the json sent from socketSend(data)
      *  // logics are applied here so that messages are only received on specific clients
      *  console.log(message);
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
       * @example
       *
       * this.API.sendFeedback('succes', 'Pushed data!')
       *
     **/
    sendFeedback(type, message, timer) {
        this.coreFeedback = {
            type: type,
            message: message,
        };
        if (timer != undefined) {
            // Set a timer to reset the snackbar feedback after 2 seconds
            setTimeout(() => {
                this.coreFeedback = undefined;
            }, timer);
        }
    }
    /**
       * Store API feedback for snackbars and other display feedback
       *
       * @returns - A feedback object with {type, message}
       *
       * @example
       *
       * getFeedback(){
       *   return this.API.getFeedback();
       * }
       *
       * OUTPUT:
       *  // Snackbars in app.component.ts (root)
       *  <div class='snackbar' *ngIf='getFeedback().type != undefined'> Some Feedback </div>
       *
       *
     **/
    getFeedback() {
        return this.coreFeedback;
    }
    /**
      * Creates a hash from the server for non decryptable data
      *
      * @param text - A string to encrypt
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
    async hash(text) {
        const response = await firstValueFrom(this.post('get_hash', { text: text }));
        if (response.success) {
            return response.output;
        }
        else {
            return null;
        }
    }
    /**
      * Encrypts a text
      *
      * @param text - A string to encrypt
      *
      * @returns A string an encrypted text or null if an error has occured
      *
      * @example
      * const encrypted = this.API.encrypt('ken');
      * if(encrypt){
      *  console.log(encrypt);
      * }else{
      *  console.log('ERROR');
      * }
      *
    **/
    async encrypt(text) {
        const response = await firstValueFrom(this.post('encrypt', { text: text }));
        if (response.success) {
            return response.output;
        }
        else {
            return null;
        }
    }
    /**
      * Decrypt an encrypted text in the server to get plain text
      *
      * @param encrypted - A string to encrypt
      *
      * @returns A string the plain text of an encrypted text or null if an error has occured
      *
      * @example
      * const plainText = this.API.decrypt('Asi12iUSIDUAISDU12');
      * if(plainText){
      *  console.log(plainText);
      * }else{
      *  console.log('ERROR');
      * }
      *
    **/
    async decrypt(encrypted) {
        const response = await firstValueFrom(this.post('decrypt', { encrypted: encrypted }));
        if (response.success) {
            return response.output;
        }
        else {
            return null;
        }
    }
    /**
      * Checks if a value matches a hash
      *
      * @param text - A string to check
      *
      * @param hash - A hash string to check
      *
      * @returns - True if text and hash matches, false otherwise
      *
      * @example
      * const match = this.API.verifyHash('text','$2aasdkk2.123i123ijasudfklajsdla');
      * if(match == null){
      *  console.log('ERROR');
       * return;
      * }
      *
      * console.log(match);
      *
    **/
    async verifyHash(text, hash) {
        const response = await firstValueFrom(this.post('verify_hash', { text: text, hash: hash }));
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
            App: this.config?.app,
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
            return this.config?.server + `/${this.config.app}/` + file;
        }
        return file;
    }
    /**
      * Uploads a file to the server
      *
      * @param file - A File to upload
      * @param filename - A string that points to where the file to be stored in the server
      * @param chunkSize - A number representing the number of bytes to upload per chunk
      *
      * @example
      *
      * getUploadProgress(){
      *  return this.API.uploadProgress
      * }
      *
      * await this.API.uploadFile(somefile, 'files/profile.png');
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
                    const $sub = this.http
                        .post(this.config?.nodeserver + '/filehandler-progress', {
                        key: this.config?.apiKey,
                        app: this.config?.app,
                        method: 'create_url',
                        chunk: base64String,
                        fileName: filename,
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
                                $sub.unsubscribe();
                                resolve(); // Resolve the promise when the upload is complete
                            }
                        },
                        error: (err) => {
                            $sub.unsubscribe();
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
    async disposeFile(filename) {
        await firstValueFrom(this.http
            .post(this.config?.nodeserver + '/filehandler-progress', {
            key: this.config?.apiKey,
            app: this.config?.app,
            method: 'delete_url',
            fileName: filename,
        }));
    }
    ;
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonCoreService, deps: [{ token: i1.HttpClient }, { token: i2.Router }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonCoreService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonCoreService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: i2.Router }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1jb3JlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWNvcmUvc3JjL2xpYi91c3dhZ29uLWNvcmUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBYSxNQUFNLGVBQWUsQ0FBQztBQUd0RCxPQUFPLEVBQVUsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBSzlDLE1BQU0sT0FBTyxrQkFBa0I7SUFrQzdCLFlBQ1UsSUFBZ0IsRUFDaEIsTUFBYztRQURkLFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQXRCaEIsZUFBVSxHQUFZLEVBQUUsQ0FBQTtRQUMvQjs7Ozs7Ozs7Ozs7V0FXRztRQUNHLGFBQVEsR0FBWSxFQUFFLENBQUE7UUFJckIsZUFBVSxHQUFxRCxFQUFFLENBQUM7SUFNdEUsQ0FBQztJQUVMLGlCQUFpQjtJQUNqQjs7Ozs7Ozs7Ozs7OztRQWFJO0lBQ0osVUFBVSxDQUFDLE1BQWlCO1FBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLGFBQWEsQ0FBQztRQUN2QyxJQUFJLENBQUMsTUFBTyxDQUFDLFNBQVMsR0FBRyxDQUFDLE9BQU8sRUFBQyxFQUFFO1lBQ2xDLElBQUksY0FBYyxHQUFHLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENB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QUFDOzRCQUNuQiwrQ0FBK0M7NEJBQy9DLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLDhCQUE4Qjt3QkFDN0MsQ0FBQztxQkFDRixDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDO2dCQUVGLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDO1lBRUYsa0NBQWtDO1lBQ2xDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQWdCO1FBQzlCLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJO2FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVUsR0FBRyx1QkFBdUIsRUFBRTtZQUN2RCxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNO1lBQ3hCLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUc7WUFDckIsTUFBTSxFQUFFLFlBQVk7WUFDcEIsUUFBUSxFQUFHLFFBQVE7U0FDcEIsQ0FBQyxDQUFDLENBQ0Y7SUFDTCxDQUFDO0lBQUEsQ0FBQzsrR0Fub0JTLGtCQUFrQjttSEFBbEIsa0JBQWtCLGNBRmpCLE1BQU07OzRGQUVQLGtCQUFrQjtrQkFIOUIsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwSGVhZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IEluamVjdGFibGUsIE9uRGVzdHJveSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IENvcmVDb25maWcsIENvcmVDcmVhdGVPYmplY3QsIENvcmVEZWxldGVPYmplY3QsIENvcmVGb3JtLCBDb3JlUmVhZE9iamVjdCwgQ29yZVJlc3BvbnNlLCBDb3JlVXBkYXRlT2JqZWN0LCBTbmFja2JhckNvcmVGZWVkYmFjayB9IGZyb20gJy4vdHlwZXMvdXN3YWdvbi1jb3JlLnR5cGVzJztcbmltcG9ydCB7ICBmaXJzdCwgZmlyc3RWYWx1ZUZyb20gfSBmcm9tICdyeGpzJztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgVXN3YWdvbkNvcmVTZXJ2aWNlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgIC8qKlxuICAgICAqIFVwbG9hZCBwcm9ncmVzcyBpbmRpY2F0b3Igb24gY3VycmVudCBmaWxlIHVwbG9hZFxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogZ2V0VXBsb2FkUHJvZ3Jlc3MoKXtcbiAgICAgKiAgcmV0dXJuIHRoaXMuQVBJLnVwbG9hZFByb2dyZXNzO1xuICAgICAqIH1cbiAgICAgKiAgXG4gICAqKi9cbiAgcHVibGljIHVwbG9hZFByb2dyZXNzPzpudW1iZXI7XG5cbiAgcHJpdmF0ZSBjb3JlRmVlZGJhY2s/OlNuYWNrYmFyQ29yZUZlZWRiYWNrO1xuXG4gIHByaXZhdGUgcHVibGljRm9ybTpDb3JlRm9ybSA9IHt9XG4gICAvKipcbiAgICAgKiBTZWN1cmUgZm9ybSBmb3Igc3RvcmluZyBtb3JlIHNlY3VyZSBpbnB1dFxuICAgICAqIFxuICAgICAqIE5PVEU6IFRoaXMgaXMgdGhlIGZvcm0gdGhhdCBzaG91bGQgYmUgdXNlZCB3aGVuIGJ1aWxkaW5nIHBvc3RPYmplY3RzXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBmb3IobGV0IGtleSBpbiB0aGlzLkFQSS5jb3JlRm9ybSl7XG4gICAgICogIC8vIHByb2Nlc3MgdmFsdWVcbiAgICAgKiAgY29uc29sZS5sb2codGhpcy5BUEkuY29yZUZvcm1ba2V5XSk7XG4gICAgICogfVxuICAgICAqIFxuICAgKiovXG4gIHB1YmxpYyBjb3JlRm9ybTpDb3JlRm9ybSA9IHt9XG4gIFxuICBwcml2YXRlIHNvY2tldD86IFdlYlNvY2tldDtcbiAgcHJpdmF0ZSBjb25maWc/OiBDb3JlQ29uZmlnO1xuICBwcml2YXRlIGxpdmVFdmVudHM6e1trZXk6IHN0cmluZ106IChtZXNzYWdlOiBNZXNzYWdlRXZlbnQpID0+IHZvaWQgfSA9IHt9O1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXG4gICkgeyB9XG5cbiAgLy8gSU5JVElBTElaQVRJT05cbiAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIHNlcnZpY2UgZm9yIHRoZSBwcm9qZWN0XG4gICAgICogQHBhcmFtIGNvbmZpZyAtIGNvbmZpZ3VyYXRpb24gdGhhdCBwb2ludHMgdGhlIHNlcnZpY2UgdG8gaXRzIGFwcHJvcHJpYXRlIHNlcnZlclxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogdGhpcy5BUEkuaW5pdGlhbGl6ZSh7XG4gICAgICogIGFwaTplbnZpcm9ubWVudC5hcGksXG4gICAgICogIGFwaUtleTogZW52aXJvbm1lbnQuYXBpS2V5LFxuICAgICAqICBub2Rlc2VydmVyOiBlbnZpcm9ubWVudC5ub2Rlc2VydmVyLFxuICAgICAqICBzZXJ2ZXI6IGVudmlyb25tZW50LnNlcnZlcixcbiAgICAgKiAgc29ja2V0OiBlbnZpcm9ubWVudC5zb2NrZXRcbiAgICAgKiB9KVxuICAgICAqIFxuICAgKiovXG4gIGluaXRpYWxpemUoY29uZmlnOkNvcmVDb25maWcpe1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldChjb25maWcuc29ja2V0KTtcbiAgICB0aGlzLnNvY2tldC5iaW5hcnlUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgICB0aGlzLnNvY2tldCEub25tZXNzYWdlID0gKG1lc3NhZ2UpPT57XG4gICAgICB2YXIgZGVjb2RlZE1lc3NhZ2UgPSBuZXcgVGV4dERlY29kZXIoJ3V0Zi04JykuZGVjb2RlKG1lc3NhZ2UuZGF0YSk7XG4gICAgICBjb25zdCBzb2NrZXREYXRhID0gSlNPTi5wYXJzZShkZWNvZGVkTWVzc2FnZSk7XG4gICAgICBpZihzb2NrZXREYXRhLmFwcCAhPSBjb25maWcuYXBwKSByZXR1cm47XG4gICAgICBmb3IgKGNvbnN0IGlkIGluIHRoaXMubGl2ZUV2ZW50cykge1xuICAgICAgICAgIHRoaXMubGl2ZUV2ZW50c1tpZF0oc29ja2V0RGF0YS5kYXRhKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAgLyoqXG4gICAgICogQWRkIGEgbmV3IGxpdmUgbGlzdGVuZXIgZnJvbSB0aGUgc2VydmVyJ3Mgd2Vic29ja2V0XG4gICAgICogXG4gICAgICogQHBhcmFtIGlkIC0gVW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoZSBsaXN0ZW5lcnMgdG8gYXZvaWQgY29sbGlzaW9uc1xuICAgICAqIEBwYXJhbSBoYW5kbGVyIC0gV2Vic29ja2V0IG1lc3NhZ2VzIGFyZSBwYXNzZWQgdG8gdGhpcyBoYW5kbGVyXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLmFkZExpdmVMaXN0ZW5lcignZXZlbnQtMScsKG1lc3NhZ2U6e1trZXk6c3RyaW5nXTphbnl9KT0+e1xuICAgICAqICBPVVRQVVQ6XG4gICAgICogIC8vIHNhbWUgYXMgdGhlIGpzb24gc2VudCBmcm9tIHNvY2tldFNlbmQoZGF0YSlcbiAgICAgKiAgLy8gbG9naWNzIGFyZSBhcHBsaWVkIGhlcmUgc28gdGhhdCBtZXNzYWdlcyBhcmUgb25seSByZWNlaXZlZCBvbiBzcGVjaWZpYyBjbGllbnRzXG4gICAgICogIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgICAqIH0pXG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgYWRkU29ja2V0TGlzdGVuZXIoIGlkOnN0cmluZyxoYW5kbGVyOihtZXNzYWdlOiB7W2tleTpzdHJpbmddOmFueX0pPT52b2lkKSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIHRoaXMubGl2ZUV2ZW50c1tpZF09IGhhbmRsZXI7XG4gIH1cbiAgLyoqXG4gICAgICogR2V0IGxpc3Qgb2YgbGl2ZSBsaXN0ZW5lcnMgaW4gdGhlIHByb2plY3RcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdGhpcy5BUEkuZ2V0TGlzdGVuZXJzKCk7XG4gICAgICogXG4gICAgICogT1VUUFVUOiBBbiBhbGVydCBzaG93aW5nIGxpc3Qgb2YgbGlzdGVuZXJzXG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgZ2V0TGlzdGVuZXJzKCkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICBhbGVydChKU09OLnN0cmluZ2lmeShPYmplY3Qua2V5cyh0aGlzLmxpdmVFdmVudHMpKSk7XG4gIH1cbiAgLyoqXG4gICAgICogU2VuZHMgYSBtZXNzYWdlIHRvIHRoZSB3ZWJzb2NrZXRcbiAgICAgKiBAcGFyYW0gZGF0YSAtIEEganNvbiBvYmplY3QgbWVzc2FnZVxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0aGlzLkFQSS5zb2NrZXRTZW5kKHtcbiAgICAgKiAgICB0bzogc3R1ZGVudC5pZCxcbiAgICAgKiAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAqIH0pXG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgc29ja2V0U2VuZChkYXRhOiBvYmplY3QpIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgdGhpcy5zb2NrZXQhLm9ub3BlbiA9ICgpPT57XG4gICAgICB0aGlzLnNvY2tldCEuc2VuZChcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoeyBrZXk6IHRoaXMuY29uZmlnPy5hcGlLZXksIGRhdGE6IGRhdGEgfSlcbiAgICAgICk7XG4gICAgfVxuICB9XG4gIFxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLnNvY2tldD8uY2xvc2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgcGdFc2NhcGVTdHJpbmcoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW5wdXQgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgIH0gXG4gICAgLy8gRXNjYXBlIHNpbmdsZSBxdW90ZXMgYnkgcmVwbGFjaW5nIHRoZW0gd2l0aCB0d28gc2luZ2xlIHF1b3Rlc1xuICAgIHJldHVybiBpbnB1dC5yZXBsYWNlKC8nL2csIFwiJydcIik7XG4gIH1cblxuICAvKipcbiAgICAgKiBCdWlsZHMgYSBDb3JlRm9ybSBmcm9tIHVzZXIgaW5wdXRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXkgLSBBIHN0cmluZyByZWZlcmVuY2UgdG8gZm9ybSBrZXlcbiAgICAgKiBAcGFyYW0gdmFsdWUgLSBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIGEgZm9ybSBrZXlcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFxuICAgICAqIGhhbmRsZUlucHV0KGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKXtcbiAgICAgKiAgdGhpcy5BUEkuaGFuZGxlRm9ybVZhbHVlKCdlbWFpbCcsIGV2ZW50LnRhcmdldC52YWx1ZSk7IC8vIGtleSBzaG91bGQgYmUgaW5pdGlhbGl6ZWQgdXNpbmcgY3JlYXRlRm9ybSgpXG4gICAgICogfVxuICAgICAqIFxuICAgICAqIE9VVFBVVDpcbiAgICAgKiA8aW5wdXQgKGNoYW5nZSk9J2hhbmRsZUlucHV0KFwiZW1haWxcIiwgJGV2ZW50KScgPiBcbiAgICAgKlxuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIGhhbmRsZUZvcm1WYWx1ZShrZXk6c3RyaW5nLCB2YWx1ZTpzdHJpbmcpe1xuICAgIHRoaXMucHVibGljRm9ybVtrZXldID0gdmFsdWU7IFxuICAgIHRoaXMuY29yZUZvcm1ba2V5XSA9IHRoaXMucGdFc2NhcGVTdHJpbmcodmFsdWUpO1xuICB9XG4gICAvKipcbiAgICAgKiBCdWlsZHMgYSBDb3JlRm9ybSBmcm9tIHVzZXIgaW5wdXRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXkgLSBBIHN0cmluZyByZWZlcmVuY2UgdG8gZm9ybSBrZXlcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFxuICAgICAqIGdldElucHV0KGtleTpzdHJpbmcpe1xuICAgICAqICByZXR1cm4gdGhpcy5BUEkuZ2V0Rm9ybVZhbHVlKGtleSk7XG4gICAgICogfVxuICAgICAqIFxuICAgICAqIE9VVFBVVDpcbiAgICAgKiA8ZGl2Pnt7Z2V0SW5wdXQoJ2VtYWlsJyl9fTwvZGl2PlxuICAgICAqIFxuICAgKiovXG4gICBnZXRGb3JtVmFsdWUoa2V5OnN0cmluZyl7XG4gICAgaWYodGhpcy5wdWJsaWNGb3JtW2tleV0gPT09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnUGxlYXNlIGluaXRpYWxpemUgdGhlIGZvcm0gdXNpbmcgY3JlYXRlRm9ybShbZm9ybV0pJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnB1YmxpY0Zvcm1ba2V5XTtcbiAgfVxuXG4gIC8qKlxuICAgICAqIEluaXRpYWxpemUgYSBDb3JlRm9ybVxuICAgICAqXG4gICAgICogQHBhcmFtIGtleXMgLSBBIGxpc3Qgb2Ygc3RyaW5ncyByZXByZXNlbnRpbmcgZm9ybSBrZXlzXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0aGlzLkFQSS5jcmVhdGVGb3JtKFsnZW1haWwnXSk7XG4gICAgICogIFxuICAgICAqIE9VVFBVVDpcbiAgICAgKiBjb25zb2xlLmxvZyh0aGlzLkFQSS5jb3JlRm9ybSk7IFxuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIGNyZWF0ZUZvcm0oa2V5czpzdHJpbmdbXSl7XG4gICAgdGhpcy5wdWJsaWNGb3JtID0ga2V5cy5yZWR1Y2UoKHByZXY6YW55LGN1cnI6YW55KT0+e1xuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24ocHJldiwge1tjdXJyXTonJ30pXG4gICAgfSx7fSlcbiAgICB0aGlzLmNvcmVGb3JtID0ga2V5cy5yZWR1Y2UoKHByZXY6YW55LGN1cnI6YW55KT0+e1xuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24ocHJldiwge1tjdXJyXTonJ30pXG4gICAgfSx7fSlcbiAgfVxuXG4gIC8vIFVUSUxJVElFU1xuICAvKipcbiAgICAgKiBDcmVhdGVzIGEgaGFzaCBmcm9tIHRoZSBzZXJ2ZXIgZm9yIGVuY3J5cHRpbmcgZGF0YVxuICAgICAqXG4gICAgICogQHBhcmFtIGVuY3J5cHQgLSBBIHN0cmluZyB0byBlbmNyeXB0XG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBcbiAgICAgKiB0aGlzLkFQSS5zZW5kRmVlZGJhY2soJ3N1Y2NlcycsICdQdXNoZWQgZGF0YSEnKVxuICAgICAqIFxuICAgKiovXG4gICAgc2VuZEZlZWRiYWNrKHR5cGU6J3N1Y2Nlc3MnfCdlcnJvcid8J25ldXRyYWwnfCd3YXJuaW5nJyxtZXNzYWdlOnN0cmluZywgdGltZXI/Om51bWJlcil7XG4gICAgICB0aGlzLmNvcmVGZWVkYmFjayA9IHtcbiAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKHRpbWVyICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBTZXQgYSB0aW1lciB0byByZXNldCB0aGUgc25hY2tiYXIgZmVlZGJhY2sgYWZ0ZXIgMiBzZWNvbmRzXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuY29yZUZlZWRiYWNrID0gdW5kZWZpbmVkO1xuICAgICAgICB9LCB0aW1lcik7XG4gICAgICB9XG4gICAgfVxuICAvKipcbiAgICAgKiBTdG9yZSBBUEkgZmVlZGJhY2sgZm9yIHNuYWNrYmFycyBhbmQgb3RoZXIgZGlzcGxheSBmZWVkYmFja1xuICAgICAqIFxuICAgICAqIEByZXR1cm5zIC0gQSBmZWVkYmFjayBvYmplY3Qgd2l0aCB7dHlwZSwgbWVzc2FnZX1cbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFxuICAgICAqIGdldEZlZWRiYWNrKCl7XG4gICAgICogICByZXR1cm4gdGhpcy5BUEkuZ2V0RmVlZGJhY2soKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqICAvLyBTbmFja2JhcnMgaW4gYXBwLmNvbXBvbmVudC50cyAocm9vdClcbiAgICAgKiAgPGRpdiBjbGFzcz0nc25hY2tiYXInICpuZ0lmPSdnZXRGZWVkYmFjaygpLnR5cGUgIT0gdW5kZWZpbmVkJz4gU29tZSBGZWVkYmFjayA8L2Rpdj5cbiAgICAgKiBcbiAgICAgKiBcbiAgICoqL1xuICAgIGdldEZlZWRiYWNrKCl7XG4gICAgICByZXR1cm4gdGhpcy5jb3JlRmVlZGJhY2s7XG4gICAgfVxuICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGhhc2ggZnJvbSB0aGUgc2VydmVyIGZvciBub24gZGVjcnlwdGFibGUgZGF0YVxuICAgICAqXG4gICAgICogQHBhcmFtIHRleHQgLSBBIHN0cmluZyB0byBlbmNyeXB0XG4gICAgICogXG4gICAgICogQHJldHVybnMgQSBzdHJpbmcgaGFzaCBvciBudWxsIGlmIGFuIGVycm9yIGhhcyBvY2N1cmVkXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGhhc2ggPSB0aGlzLkFQSS5oYXNoKCdrZW4nKTtcbiAgICAgKiBpZihoYXNoKXtcbiAgICAgKiAgY29uc29sZS5sb2coaGFzaCk7XG4gICAgICogfWVsc2V7XG4gICAgICogIGNvbnNvbGUubG9nKCdFUlJPUicpO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICoqL1xuICBhc3luYyBoYXNoKHRleHQ6c3RyaW5nKXtcbiAgICBjb25zdCByZXNwb25zZSA9ICBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLnBvc3QoJ2dldF9oYXNoJywge3RleHQ6IHRleHR9KSlcbiAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgIHJldHVybiByZXNwb25zZS5vdXRwdXQ7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgIC8qKlxuICAgICAqIEVuY3J5cHRzIGEgdGV4dCBcbiAgICAgKlxuICAgICAqIEBwYXJhbSB0ZXh0IC0gQSBzdHJpbmcgdG8gZW5jcnlwdFxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIEEgc3RyaW5nIGFuIGVuY3J5cHRlZCB0ZXh0IG9yIG51bGwgaWYgYW4gZXJyb3IgaGFzIG9jY3VyZWRcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZW5jcnlwdGVkID0gdGhpcy5BUEkuZW5jcnlwdCgna2VuJyk7XG4gICAgICogaWYoZW5jcnlwdCl7XG4gICAgICogIGNvbnNvbGUubG9nKGVuY3J5cHQpO1xuICAgICAqIH1lbHNle1xuICAgICAqICBjb25zb2xlLmxvZygnRVJST1InKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAqKi9cbiAgIGFzeW5jIGVuY3J5cHQodGV4dDpzdHJpbmcpe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMucG9zdCgnZW5jcnlwdCcsIHt0ZXh0OiB0ZXh0fSkpXG4gICAgaWYocmVzcG9uc2Uuc3VjY2Vzcyl7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub3V0cHV0O1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gICAvKipcbiAgICAgKiBEZWNyeXB0IGFuIGVuY3J5cHRlZCB0ZXh0IGluIHRoZSBzZXJ2ZXIgdG8gZ2V0IHBsYWluIHRleHRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbmNyeXB0ZWQgLSBBIHN0cmluZyB0byBlbmNyeXB0XG4gICAgICogXG4gICAgICogQHJldHVybnMgQSBzdHJpbmcgdGhlIHBsYWluIHRleHQgb2YgYW4gZW5jcnlwdGVkIHRleHQgb3IgbnVsbCBpZiBhbiBlcnJvciBoYXMgb2NjdXJlZFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBwbGFpblRleHQgPSB0aGlzLkFQSS5kZWNyeXB0KCdBc2kxMmlVU0lEVUFJU0RVMTInKTtcbiAgICAgKiBpZihwbGFpblRleHQpe1xuICAgICAqICBjb25zb2xlLmxvZyhwbGFpblRleHQpO1xuICAgICAqIH1lbHNle1xuICAgICAqICBjb25zb2xlLmxvZygnRVJST1InKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAqKi9cbiAgIGFzeW5jIGRlY3J5cHQoZW5jcnlwdGVkOnN0cmluZyl7XG4gICAgY29uc3QgcmVzcG9uc2UgPSAgYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5wb3N0KCdkZWNyeXB0Jywge2VuY3J5cHRlZDogZW5jcnlwdGVkfSkpXG4gICAgaWYocmVzcG9uc2Uuc3VjY2Vzcyl7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub3V0cHV0O1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gICAvKipcbiAgICAgKiBDaGVja3MgaWYgYSB2YWx1ZSBtYXRjaGVzIGEgaGFzaFxuICAgICAqXG4gICAgICogQHBhcmFtIHRleHQgLSBBIHN0cmluZyB0byBjaGVja1xuICAgICAqIFxuICAgICAqIEBwYXJhbSBoYXNoIC0gQSBoYXNoIHN0cmluZyB0byBjaGVja1xuICAgICAqIFxuICAgICAqIEByZXR1cm5zIC0gVHJ1ZSBpZiB0ZXh0IGFuZCBoYXNoIG1hdGNoZXMsIGZhbHNlIG90aGVyd2lzZVxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBtYXRjaCA9IHRoaXMuQVBJLnZlcmlmeUhhc2goJ3RleHQnLCckMmFhc2RrazIuMTIzaTEyM2lqYXN1ZGZrbGFqc2RsYScpO1xuICAgICAqIGlmKG1hdGNoID09IG51bGwpe1xuICAgICAqICBjb25zb2xlLmxvZygnRVJST1InKTtcbiAgICAgICogcmV0dXJuO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyhtYXRjaCk7XG4gICAgICogXG4gICAqKi9cbiAgIGFzeW5jIHZlcmlmeUhhc2godGV4dDpzdHJpbmcsaGFzaDpzdHJpbmcpe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMucG9zdCgndmVyaWZ5X2hhc2gnLCB7dGV4dDogdGV4dCwgaGFzaDpoYXNofSkpXG4gICAgaWYocmVzcG9uc2Uuc3VjY2Vzcyl7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub3V0cHV0O1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgICAqIENyZWF0ZXMgYSB1bmlxdWUgaWRlbnRpZmllciB3aXRoIHRoZSBsZW5ndGggb2YgMzJcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgcmFuZG9tIHVuaXF1ZSAzMiBzdHJpbmcgaWRlbnRpZmllclxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBpZCA9IHRoaXMuQVBJLmNyZWF0ZVVuaXF1ZUlEMzIoKTtcbiAgICAgKiBcbiAgICAgKiBcbiAgICoqL1xuICBjcmVhdGVVbmlxdWVJRDMyKCkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICBjb25zdCB0aW1lc3RhbXAgPSBEYXRlLm5vdygpLnRvU3RyaW5nKDE2KTsgLy8gR2V0IGN1cnJlbnQgdGltZSBpbiBoZXhcbiAgICAgIGNvbnN0IHJhbmRvbVBhcnQgPSAneHh4eHh4eHh4eHh4eHh4eCcucmVwbGFjZSgveC9nLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogMTYgfCAwKS50b1N0cmluZygxNik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aW1lc3RhbXAgKyByYW5kb21QYXJ0LnNsaWNlKDAsIDE2KTsgLy8gQ29tYmluZSB0aW1lc3RhbXAgd2l0aCByYW5kb20gcGFydFxuICB9XG5cbiAgcHJpdmF0ZSBwb3N0KG1ldGhvZDogc3RyaW5nLCBib2R5OiB7fSkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICBmb3IgKHZhciBba2V5LCBvYmpdIG9mIE9iamVjdC5lbnRyaWVzPGFueT4oYm9keSkpIHtcbiAgICAgIGlmIChrZXkgPT0gJ3ZhbHVlcycpIHtcbiAgICAgICAgZm9yICh2YXIgW2ZpZWxkLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMob2JqKSkge1xuICAgICAgICAgIG9ialtmaWVsZF0gPSB2YWx1ZSA/PyAnJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKHtcbiAgICAgICdYLVJlcXVlc3RlZC1XaXRoJzogJ1hNTEh0dHBSZXF1ZXN0JyxcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfSk7XG4gICAgY29uc3Qgc2FsdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdDxhbnk+KFxuICAgICAgdGhpcy5jb25maWc/LmFwaSArICc/JyArIHNhbHQsXG4gICAgICBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICB7XG4gICAgICAgICAgICBBUElfS0VZOiB0aGlzLmNvbmZpZz8uYXBpS2V5LFxuICAgICAgICAgICAgQXBwOiB0aGlzLmNvbmZpZz8uYXBwLFxuICAgICAgICAgICAgTWV0aG9kOiBtZXRob2QsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBib2R5XG4gICAgICAgIClcbiAgICAgICksXG4gICAgICB7IGhlYWRlcnMgfVxuICAgICk7XG4gIH1cblxuICBcbiAgLy8gQ1JFQVRFIFJFQUQgVVBEQVRFIEFORCBERUxFVEUgSEFORExFUlNcblxuICAvKipcbiAgICAgKiBSdW5zIGFuIGluc2VydCBxdWVyeSB0byB0aGUgc2VydmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHBvc3RPYmplY3QgLSBBbiBvYmplY3QgY29udGFpbmluZyB0YWJsZXMsIGFuZCB2YWx1ZXMgZm9yIHRoZSBTUUwgcXVlcnkuXG4gICAgICogQHJldHVybnMgQSByZXNwb3NlIG9iamVjdCBcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZGV0YWlscy5wYXNzd29yZCA9IHRoaXMuQVBJLmhhc2goZGV0YWlscy5wYXNzd29yZCk7XG4gICAgICogXG4gICAgICogY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuQVBJLmNyZWF0ZSh7XG4gICAgICogICB0YWJsZXM6ICdhZG1pbicsXG4gICAgICogICB2YWx1ZXM6IHtcbiAgICAgKiAgICAnZW1haWwnOnRoaXMuQVBJLmNvcmVGb3JtWydlbWFpbCddLFxuICAgICAqICAgICdwYXNzd29yZCc6IHRoaXMuQVBJLmNvcmVGb3JtWydwYXNzd29yZCddLCBcbiAgICAgKiAgfSxcbiAgICAgKiB9KTtcbiAgICAgKiBcbiAgICAgKiBpZihkYXRhLnN1Y2Nlc3Mpe1xuICAgICAqICBjb25zb2xlLmxvZyhkYXRhLm91dHB1dCk7XG4gICAgICogfVxuICAgICAqIFxuICAgKiovXG4gIGFzeW5jIGNyZWF0ZShwb3N0T2JqZWN0OkNvcmVDcmVhdGVPYmplY3QpOlByb21pc2U8Q29yZVJlc3BvbnNlPntcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgcmV0dXJuICBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLnBvc3QoJ2NyZWF0ZV9lbnRyeScsIHtcbiAgICAgICdkYXRhJzogSlNPTi5zdHJpbmdpZnkocG9zdE9iamVjdCksXG4gICAgfSkpO1xuICB9XG5cbiAgLyoqXG4gICAgICogUnVucyBhbiByZWFkIHF1ZXJ5IHRvIHRoZSBzZXJ2ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcG9zdE9iamVjdCAtIEFuIG9iamVjdCBjb250YWluaW5nIHNlbGVjdG9ycywgdGFibGVzLCBhbmQgY29uZGl0aW9ucyBmb3IgdGhlIFNRTCBxdWVyeS5cbiAgICAgKiBAcmV0dXJucyBBIHJlc3Bvc2Ugb2JqZWN0IFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5BUEkucmVhZCh7XG4gICAgICogICBzZWxlY3RvcnM6IFtcbiAgICAgKiAgICAgJ2ZfYWRtaW4uSUQnLFxuICAgICAqICAgICAnVXNlcm5hbWUnLFxuICAgICAqICAgICAnRW1haWwnLFxuICAgICAqICAgICAnQ09VTlQoZl9tZXNzYWdlcy5JRCkgYXMgaW5ib3gnXG4gICAgICogICBdLFxuICAgICAqICAgdGFibGVzOiAnZl9hZG1pbicsXG4gICAgICogICBjb25kaXRpb25zOiBgV0hFUkUgZW1haWwgPSAke3RoaXMuQVBJLmNvcmVGb3JtWydlbWFpbCddfWBcbiAgICAgKiB9KTtcbiAgICAgKiBcbiAgICAgKiBpZihkYXRhLnN1Y2Nlc3MgJiYgZGF0YS5vdXRwdXQubGVuZ3RoID4gMCl7XG4gICAgICogLy8gc2luZ2xlIG91dHB1dFxuICAgICAqICBjb25zb2xlLmxvZyhkYXRhLm91dHB1dFswXSk7XG4gICAgICogLy8gYWxsIG91dHRwdXRcbiAgICAgKiAgZm9yKGxldCByb3cgb2YgZGF0YS5vdXRwdXQpe1xuICAgICAqICAgIGNvbnNvbGUubG9nKHJvdyk7XG4gICAgICogIH1cbiAgICAgKiB9XG4gICAgICogXG4gICAqKi9cbiAgYXN5bmMgcmVhZChwb3N0T2JqZWN0OkNvcmVSZWFkT2JqZWN0KTpQcm9taXNlPENvcmVSZXNwb25zZT57XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLnBvc3QoJ2dldF9lbnRyaWVzJywge1xuICAgICAgJ2RhdGEnOiBKU09OLnN0cmluZ2lmeShwb3N0T2JqZWN0KSxcbiAgICB9KSk7XG4gIH1cbiAgIC8qKlxuICAgICAqIFJ1bnMgYW4gdXBkYXRlIHF1ZXJ5IHRvIHRoZSBzZXJ2ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcG9zdE9iamVjdCAtIEFuIG9iamVjdCBjb250YWluaW5nIHNlbGVjdG9ycywgdmFsdWVzICx0YWJsZXMsIGFuZCBjb25kaXRpb25zIGZvciB0aGUgU1FMIHF1ZXJ5LlxuICAgICAqIEByZXR1cm5zIEEgcmVzcG9zZSBvYmplY3QgXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGVuY3J5cHRlZCA9IHRoaXMuQVBJLmhhc2godGhpcy5BUEkuY29yZUZvcm1bJ3Bhc3N3b3JkJ10pO1xuICAgICAqIFxuICAgICAqIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLkFQSS51cGRhdGUoe1xuICAgICAqICAgdGFibGVzOiAnZl9hZG1pbicsXG4gICAgICogICB2YWx1ZXM6IHtcbiAgICAgKiAgICAnZW1haWwnOnRoaXMuQVBJLmNvcmVGb3JtWydlbWFpbCddLFxuICAgICAqICAgICdwYXNzd29yZCc6IGVuY3J5cHRlZCwgXG4gICAgICogICB9LFxuICAgICAqICAgY29uZGl0aW9uczogYFdIRVJFIGVtYWlsID0gJHt0aGlzLkFQSS5jb3JlRm9ybVsnZW1haWwnXX1gXG4gICAgICogfSk7XG4gICAgICogXG4gICAgICogaWYoZGF0YS5zdWNjZXNzKXtcbiAgICAgKiAgIGNvbnNvbGUubG9nKGRhdGEub3V0cHV0KTtcbiAgICAgKiB9XG4gICAgICogXG4gICAqKi9cbiAgYXN5bmMgdXBkYXRlKHBvc3RPYmplY3Q6Q29yZVVwZGF0ZU9iamVjdCk6UHJvbWlzZTxDb3JlUmVzcG9uc2U+e1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgIHJldHVybiBmaXJzdFZhbHVlRnJvbSggdGhpcy5wb3N0KCd1cGRhdGVfZW50cnknLCB7XG4gICAgJ2RhdGEnOiBKU09OLnN0cmluZ2lmeShwb3N0T2JqZWN0KSxcbiAgfSkpO1xuICB9XG5cbiAgLyoqXG4gICAgICogUnVucyBhbiBkZWxldGUgcXVlcnkgdG8gdGhlIHNlcnZlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwb3N0T2JqZWN0IC0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGFibGVzLCBhbmQgY29uZGl0aW9ucyBmb3IgdGhlIFNRTCBxdWVyeS5cbiAgICAgKiBAcmV0dXJucyBBIHJlc3Bvc2Ugb2JqZWN0IFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5BUEkuZGVsZXRlKHtcbiAgICAgKiAgIHRhYmxlczogJ2ZfYWRtaW4nLFxuICAgICAqICAgY29uZGl0aW9uczogYFdIRVJFIGVtYWlsID0gJHt0aGlzLkFQSS5jb3JlRm9ybVsnZW1haWwnXX1gXG4gICAgICogfSk7XG4gICAgICogXG4gICAgICogaWYoZGF0YS5zdWNjZXNzKXtcbiAgICAgKiAgIGNvbnNvbGUubG9nKGRhdGEub3V0cHV0KTtcbiAgICAgKiB9XG4gICAgICogXG4gICAqKi9cbiAgYXN5bmMgZGVsZXRlKHBvc3RPYmplY3Q6Q29yZURlbGV0ZU9iamVjdCk6UHJvbWlzZTxDb3JlUmVzcG9uc2U+e1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICByZXR1cm4gYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5wb3N0KCdkZWxldGVfZW50cnknLCB7XG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShwb3N0T2JqZWN0KSxcbiAgICB9KSlcbiAgfVxuXG4gIC8vIEZJTEUgSEFORExFUlNcblxuICAgLyoqXG4gICAgICogR2V0IGNvbXBsZXRlIGZpbGUgVVJMIGZyb20gdGhlIHNlcnZlclxuICAgICAqXG4gICAgICogQHBhcmFtIGZpbGUgLSBBIHN0cmluZyB0aGF0IHBvaW50cyB0byB0aGUgZmlsZS5cbiAgICAgKiBAcmV0dXJucyBBIGNvbXBsZXRlIHVybCBzdHJpbmcgZnJvbSB0aGUgc2VydmVyIFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCB1cmwgPSB0aGlzLkFQSS5nZXRGaWxlVVJMKCdmaWxlcy9wcm9maWxlLnBuZycpO1xuICAgICAqIFxuICAgICAqIE9VVFBVVDpcbiAgICAgKiAgaHR0cHM6Ly9sb2NhbGhvc3Q6ODA4MC9maWxlcy9wcm9maWxlLnBuZ1xuICAgICAqIFxuICAgKiovXG4gIGdldEZpbGVVUkwoZmlsZTogc3RyaW5nKTpzdHJpbmd8dW5kZWZpbmVkIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoXCJQbGVhc2UgaW5pdGlhbGl6ZSB1c3dhZ29uIGNvcmUgb24gcm9vdCBhcHAuY29tcG9uZW50LnRzXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZmlsZSkge1xuICAgICAgaWYgKGZpbGUuaW5jbHVkZXMoJ2h0dHAnKSkgcmV0dXJuIGZpbGU7XG4gICAgICByZXR1cm4gdGhpcy5jb25maWc/LnNlcnZlciArIGAvJHt0aGlzLmNvbmZpZy5hcHB9L2AgKyBmaWxlIDtcbiAgICB9XG4gICAgcmV0dXJuIGZpbGU7XG4gIH1cblxuICAgLyoqXG4gICAgICogVXBsb2FkcyBhIGZpbGUgdG8gdGhlIHNlcnZlclxuICAgICAqXG4gICAgICogQHBhcmFtIGZpbGUgLSBBIEZpbGUgdG8gdXBsb2FkXG4gICAgICogQHBhcmFtIGZpbGVuYW1lIC0gQSBzdHJpbmcgdGhhdCBwb2ludHMgdG8gd2hlcmUgdGhlIGZpbGUgdG8gYmUgc3RvcmVkIGluIHRoZSBzZXJ2ZXJcbiAgICAgKiBAcGFyYW0gY2h1bmtTaXplIC0gQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBudW1iZXIgb2YgYnl0ZXMgdG8gdXBsb2FkIHBlciBjaHVua1xuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBcbiAgICAgKiBnZXRVcGxvYWRQcm9ncmVzcygpe1xuICAgICAqICByZXR1cm4gdGhpcy5BUEkudXBsb2FkUHJvZ3Jlc3NcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogYXdhaXQgdGhpcy5BUEkudXBsb2FkRmlsZShzb21lZmlsZSwgJ2ZpbGVzL3Byb2ZpbGUucG5nJyk7XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqIDxkaXY+e3tnZXRVcGxvYWRQcm9ncmVzcygpfX08ZGl2PiAvLyBkeW5hbWljYWxseSB1cGRhdGVzIHRoZSBwcm9ncmVzc1xuICAgKiovXG4gIHVwbG9hZEZpbGUoZmlsZTogRmlsZSwgZmlsZW5hbWU6IHN0cmluZywgY2h1bmtTaXplOiBudW1iZXIgPSAxMDI0ICogMTAyNCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydChcIlBsZWFzZSBpbml0aWFsaXplIHVzd2Fnb24gY29yZSBvbiByb290IGFwcC5jb21wb25lbnQudHNcIik7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKCk9PntyZXR1cm4gbnVsbH0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdG90YWxDaHVua3MgPSBNYXRoLmNlaWwoZmlsZS5zaXplIC8gY2h1bmtTaXplKTtcbiAgICAgIGxldCB1cGxvYWRlZENodW5rcyA9IDA7IC8vIFRyYWNrIHVwbG9hZGVkIGNodW5rc1xuXG4gICAgICBjb25zdCB1cGxvYWRDaHVuayA9IChjaHVua0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBjaHVua0luZGV4ICogY2h1bmtTaXplO1xuICAgICAgICBjb25zdCBlbmQgPSBNYXRoLm1pbihzdGFydCArIGNodW5rU2l6ZSwgZmlsZS5zaXplKTtcbiAgICAgICAgY29uc3QgY2h1bmsgPSBmaWxlLnNsaWNlKHN0YXJ0LCBlbmQpO1xuXG4gICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIHJlYWRlci5vbmxvYWRlbmQgPSAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgYmFzZTY0U3RyaW5nID0gKHJlYWRlci5yZXN1bHQgYXMgc3RyaW5nKS5zcGxpdCgnLCcpWzFdO1xuXG4gICAgICAgICAgY29uc3QgJHN1YiA9IHRoaXMuaHR0cFxuICAgICAgICAgICAgLnBvc3QodGhpcy5jb25maWc/Lm5vZGVzZXJ2ZXIgKyAnL2ZpbGVoYW5kbGVyLXByb2dyZXNzJywge1xuICAgICAgICAgICAgICBrZXk6IHRoaXMuY29uZmlnPy5hcGlLZXksXG4gICAgICAgICAgICAgIGFwcDogdGhpcy5jb25maWc/LmFwcCxcbiAgICAgICAgICAgICAgbWV0aG9kOiAnY3JlYXRlX3VybCcsXG4gICAgICAgICAgICAgIGNodW5rOiBiYXNlNjRTdHJpbmcsXG4gICAgICAgICAgICAgIGZpbGVOYW1lOiAgZmlsZW5hbWUsXG4gICAgICAgICAgICAgIGNodW5rSW5kZXg6IGNodW5rSW5kZXgsXG4gICAgICAgICAgICAgIHRvdGFsQ2h1bmtzOiB0b3RhbENodW5rcyxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICAgbmV4dDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHVwbG9hZGVkQ2h1bmtzKys7XG4gICAgICAgICAgICAgICAgdGhpcy51cGxvYWRQcm9ncmVzcyA9IE1hdGgucm91bmQoKHVwbG9hZGVkQ2h1bmtzIC8gdG90YWxDaHVua3MpICogMTAwKTtcbiAgICAgICAgICAgICAgICBpZiAoY2h1bmtJbmRleCArIDEgPCB0b3RhbENodW5rcykge1xuICAgICAgICAgICAgICAgICAgLy8gVXBsb2FkIG5leHQgY2h1bmtcbiAgICAgICAgICAgICAgICAgIHVwbG9hZENodW5rKGNodW5rSW5kZXggKyAxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYEZpbGUgdXBsb2FkIGNvbXBsZXRlOiAke2ZpbGVuYW1lfWApO1xuICAgICAgICAgICAgICAgICAgdGhpcy51cGxvYWRQcm9ncmVzcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICRzdWIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTsgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSB3aGVuIHRoZSB1cGxvYWQgaXMgY29tcGxldGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGVycm9yOiAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgJHN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwbG9hZGluZyBjaHVuaycsIGVycik7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7IC8vIFJlamVjdCB0aGUgcHJvbWlzZSBvbiBlcnJvclxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoY2h1bmspO1xuICAgICAgfTtcblxuICAgICAgLy8gU3RhcnQgdXBsb2FkaW5nIHRoZSBmaXJzdCBjaHVua1xuICAgICAgdXBsb2FkQ2h1bmsoMCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBkaXNwb3NlRmlsZShmaWxlbmFtZTogc3RyaW5nKXtcbiAgICAgIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMuaHR0cFxuICAgICAgLnBvc3QodGhpcy5jb25maWc/Lm5vZGVzZXJ2ZXIgKyAnL2ZpbGVoYW5kbGVyLXByb2dyZXNzJywge1xuICAgICAgICBrZXk6IHRoaXMuY29uZmlnPy5hcGlLZXksXG4gICAgICAgIGFwcDogdGhpcy5jb25maWc/LmFwcCxcbiAgICAgICAgbWV0aG9kOiAnZGVsZXRlX3VybCcsXG4gICAgICAgIGZpbGVOYW1lOiAgZmlsZW5hbWUsXG4gICAgICB9KSlcbiAgICAgIDtcbiAgfTtcbiAgXG59XG4iXX0=