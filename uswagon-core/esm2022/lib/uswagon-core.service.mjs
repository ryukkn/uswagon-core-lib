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
        /**
          * Get loading status of the API
          *
          * @example
          * getUploadProgress(){
          *  return this.API.isLoading;
          * }
          *
        **/
        this.isLoading = false;
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
            this.socket.send(JSON.stringify({ key: this.config?.apiKey, app: this.config?.app, data: data }));
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
        return input.replace(/'/g, "''").trim();
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
       *  this.API.handleFormValue('email', event.target.value); // key should be initialized using initializeForm()
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
            alert('Please initialize the form using initializeForm([...fields])');
        }
        return this.publicForm[key];
    }
    /**
       * Initialize a CoreForm
       *
       * @param keys - A list of strings representing form keys
       *
       * @example
       * this.API.initializeForm(['email']);
       *
       * OUTPUT:
       * console.log(this.API.coreForm);
       *
       *
     **/
    initializeForm(keys) {
        this.publicForm = keys.reduce((prev, curr) => {
            return Object.assign(prev, { [curr]: '' });
        }, {});
        this.coreForm = keys.reduce((prev, curr) => {
            return Object.assign(prev, { [curr]: '' });
        }, {});
    }
    // UTILITIES
    /**
       * Mark the status of the API as loading
       *
       * @param isLoading - A boolean indicating whether the API is loading
       *
       * @example
       *
       * this.API.setLoading(true)
       *
       * console.log(this.API.isLoading);
       *
     **/
    setLoading(isLoading) {
        this.isLoading = isLoading;
    }
    /**
       * Creates a hash from the server for encrypting data
       *
       * @param encrypt - A string to encrypt
       *
       * @example
       *
       * this.API.sendFeedback('success', 'Pushed data!')
       *
     **/
    sendFeedback(type, message, timer) {
        this.coreFeedback = {
            type: type,
            message: message,
        };
        if (timer != undefined) {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            // Set a timer to reset the snackbar feedback after 2 seconds
            this.timeout = setTimeout(() => {
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
      * @returns A string hash or throws an error if an error has occured
      *
      * @example
      * const hash = this.API.hash('ken');
      *
      * console.log(hash);
      *
    **/
    async hash(text) {
        const response = await firstValueFrom(this.post('get_hash', { text: text }));
        if (response.success) {
            return response.output;
        }
        else {
            throw new Error('Unable to hash: Server Error');
        }
    }
    /**
      * Encrypts a text
      *
      * @param text - A string to encrypt
      *
      * @returns A string an encrypted text or throws an error if an error has occured
      *
      * @example
      * const encrypted = this.API.encrypt('ken');
      *
      * console.log(encrypted);
      *
    **/
    async encrypt(text) {
        const response = await firstValueFrom(this.post('encrypt', { text: text }));
        if (response.success) {
            return response.output;
        }
        else {
            throw new Error('Unable to encrypt: Server Error');
        }
    }
    /**
      * Decrypt an encrypted text in the server to get plain text
      *
      * @param encrypted - A string to encrypt
      *
      * @returns A string the plain text of an encrypted text or or throws an error if an error has occured
      *
      * @example
      * const plainText = this.API.decrypt('Asi12iUSIDUAISDU12');
      *
      * console.log(plainText);
      *
    **/
    async decrypt(encrypted) {
        const response = await firstValueFrom(this.post('decrypt', { encrypted: encrypted }));
        if (response.success) {
            return response.output;
        }
        else {
            throw new Error('Unable to decrypt hash: Server Error');
        }
    }
    /**
      * Checks if a value matches a hash
      *
      * @param text - A string to check
      *
      * @param hash - A hash string to check
      *
      * @returns - True if text and hash matches, false otherwise. Throws an error if an error has occurred.
      *
      * @example
      * const match = this.API.verifyHash('text','$2aasdkk2.123i123ijasudfklajsdla');
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
            throw new Error('Unable to verify hash: Server Error');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1jb3JlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWNvcmUvc3JjL2xpYi91c3dhZ29uLWNvcmUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBYSxNQUFNLGVBQWUsQ0FBQztBQUd0RCxPQUFPLEVBQVUsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBSzlDLE1BQU0sT0FBTyxrQkFBa0I7SUEyQzdCLFlBQ1UsSUFBZ0IsRUFDaEIsTUFBYztRQURkLFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQWxDdkI7Ozs7Ozs7O1dBUUc7UUFDRyxjQUFTLEdBQVcsS0FBSyxDQUFDO1FBR3pCLGVBQVUsR0FBWSxFQUFFLENBQUE7UUFDL0I7Ozs7Ozs7Ozs7O1dBV0c7UUFDRyxhQUFRLEdBQVksRUFBRSxDQUFBO1FBSXJCLGVBQVUsR0FBcUQsRUFBRSxDQUFDO0lBTXRFLENBQUM7SUFFTCxpQkFBaUI7SUFDakI7Ozs7Ozs7Ozs7Ozs7UUFhSTtJQUNKLFVBQVUsQ0FBQyxNQUFpQjtRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxhQUFhLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU8sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxPQUFPLEVBQUMsRUFBRTtZQUNsQyxJQUFJLGNBQWMsR0FBRyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25F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R0FwcEJTLGtCQUFrQjttSEFBbEIsa0JBQWtCLGNBRmpCLE1BQU07OzRGQUVQLGtCQUFrQjtrQkFIOUIsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwSGVhZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IEluamVjdGFibGUsIE9uRGVzdHJveSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IENvcmVDb25maWcsIENvcmVDcmVhdGVPYmplY3QsIENvcmVEZWxldGVPYmplY3QsIENvcmVGb3JtLCBDb3JlUmVhZE9iamVjdCwgQ29yZVJlc3BvbnNlLCBDb3JlVXBkYXRlT2JqZWN0LCBTbmFja2JhckNvcmVGZWVkYmFjayB9IGZyb20gJy4vdHlwZXMvdXN3YWdvbi1jb3JlLnR5cGVzJztcbmltcG9ydCB7ICBmaXJzdCwgZmlyc3RWYWx1ZUZyb20gfSBmcm9tICdyeGpzJztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgVXN3YWdvbkNvcmVTZXJ2aWNlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgIC8qKlxuICAgICAqIFVwbG9hZCBwcm9ncmVzcyBpbmRpY2F0b3Igb24gY3VycmVudCBmaWxlIHVwbG9hZFxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogZ2V0VXBsb2FkUHJvZ3Jlc3MoKXtcbiAgICAgKiAgcmV0dXJuIHRoaXMuQVBJLnVwbG9hZFByb2dyZXNzO1xuICAgICAqIH1cbiAgICAgKiAgXG4gICAqKi9cbiAgcHVibGljIHVwbG9hZFByb2dyZXNzPzpudW1iZXI7XG4gICAvKipcbiAgICAgKiBHZXQgbG9hZGluZyBzdGF0dXMgb2YgdGhlIEFQSVxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogZ2V0VXBsb2FkUHJvZ3Jlc3MoKXtcbiAgICAgKiAgcmV0dXJuIHRoaXMuQVBJLmlzTG9hZGluZztcbiAgICAgKiB9XG4gICAgICogIFxuICAgKiovXG4gIHB1YmxpYyBpc0xvYWRpbmc6Ym9vbGVhbiA9IGZhbHNlO1xuXG4gIHByaXZhdGUgY29yZUZlZWRiYWNrPzpTbmFja2JhckNvcmVGZWVkYmFjaztcbiAgcHJpdmF0ZSBwdWJsaWNGb3JtOkNvcmVGb3JtID0ge31cbiAgIC8qKlxuICAgICAqIFNlY3VyZSBmb3JtIGZvciBzdG9yaW5nIG1vcmUgc2VjdXJlIGlucHV0XG4gICAgICogXG4gICAgICogTk9URTogVGhpcyBpcyB0aGUgZm9ybSB0aGF0IHNob3VsZCBiZSB1c2VkIHdoZW4gYnVpbGRpbmcgcG9zdE9iamVjdHNcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGZvcihsZXQga2V5IGluIHRoaXMuQVBJLmNvcmVGb3JtKXtcbiAgICAgKiAgLy8gcHJvY2VzcyB2YWx1ZVxuICAgICAqICBjb25zb2xlLmxvZyh0aGlzLkFQSS5jb3JlRm9ybVtrZXldKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAqKi9cbiAgcHVibGljIGNvcmVGb3JtOkNvcmVGb3JtID0ge31cbiAgcHJpdmF0ZSBzb2NrZXQ/OiBXZWJTb2NrZXQ7XG4gIHByaXZhdGUgY29uZmlnPzogQ29yZUNvbmZpZztcbiAgcHJpdmF0ZSB0aW1lb3V0OmFueTtcbiAgcHJpdmF0ZSBsaXZlRXZlbnRzOntba2V5OiBzdHJpbmddOiAobWVzc2FnZTogTWVzc2FnZUV2ZW50KSA9PiB2b2lkIH0gPSB7fTtcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuICApIHsgfVxuXG4gIC8vIElOSVRJQUxJWkFUSU9OXG4gIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBzZXJ2aWNlIGZvciB0aGUgcHJvamVjdFxuICAgICAqIEBwYXJhbSBjb25maWcgLSBjb25maWd1cmF0aW9uIHRoYXQgcG9pbnRzIHRoZSBzZXJ2aWNlIHRvIGl0cyBhcHByb3ByaWF0ZSBzZXJ2ZXJcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLmluaXRpYWxpemUoe1xuICAgICAqICBhcGk6ZW52aXJvbm1lbnQuYXBpLFxuICAgICAqICBhcGlLZXk6IGVudmlyb25tZW50LmFwaUtleSxcbiAgICAgKiAgbm9kZXNlcnZlcjogZW52aXJvbm1lbnQubm9kZXNlcnZlcixcbiAgICAgKiAgc2VydmVyOiBlbnZpcm9ubWVudC5zZXJ2ZXIsXG4gICAgICogIHNvY2tldDogZW52aXJvbm1lbnQuc29ja2V0XG4gICAgICogfSlcbiAgICAgKiBcbiAgICoqL1xuICBpbml0aWFsaXplKGNvbmZpZzpDb3JlQ29uZmlnKXtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoY29uZmlnLnNvY2tldCk7XG4gICAgdGhpcy5zb2NrZXQuYmluYXJ5VHlwZSA9ICdhcnJheWJ1ZmZlcic7XG4gICAgdGhpcy5zb2NrZXQhLm9ubWVzc2FnZSA9IChtZXNzYWdlKT0+e1xuICAgICAgdmFyIGRlY29kZWRNZXNzYWdlID0gbmV3IFRleHREZWNvZGVyKCd1dGYtOCcpLmRlY29kZShtZXNzYWdlLmRhdGEpO1xuICAgICAgY29uc3Qgc29ja2V0RGF0YSA9IEpTT04ucGFyc2UoZGVjb2RlZE1lc3NhZ2UpO1xuICAgICAgaWYoc29ja2V0RGF0YS5hcHAgIT0gY29uZmlnLmFwcCkgcmV0dXJuO1xuICAgICAgZm9yIChjb25zdCBpZCBpbiB0aGlzLmxpdmVFdmVudHMpIHtcbiAgICAgICAgICB0aGlzLmxpdmVFdmVudHNbaWRdKHNvY2tldERhdGEuZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgIC8qKlxuICAgICAqIEFkZCBhIG5ldyBsaXZlIGxpc3RlbmVyIGZyb20gdGhlIHNlcnZlcidzIHdlYnNvY2tldFxuICAgICAqIFxuICAgICAqIEBwYXJhbSBpZCAtIFVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGUgbGlzdGVuZXJzIHRvIGF2b2lkIGNvbGxpc2lvbnNcbiAgICAgKiBAcGFyYW0gaGFuZGxlciAtIFdlYnNvY2tldCBtZXNzYWdlcyBhcmUgcGFzc2VkIHRvIHRoaXMgaGFuZGxlclxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0aGlzLkFQSS5hZGRMaXZlTGlzdGVuZXIoJ2V2ZW50LTEnLChtZXNzYWdlOntba2V5OnN0cmluZ106YW55fSk9PntcbiAgICAgKiAgT1VUUFVUOlxuICAgICAqICAvLyBzYW1lIGFzIHRoZSBqc29uIHNlbnQgZnJvbSBzb2NrZXRTZW5kKGRhdGEpXG4gICAgICogIC8vIGxvZ2ljcyBhcmUgYXBwbGllZCBoZXJlIHNvIHRoYXQgbWVzc2FnZXMgYXJlIG9ubHkgcmVjZWl2ZWQgb24gc3BlY2lmaWMgY2xpZW50c1xuICAgICAqICBjb25zb2xlLmxvZyhtZXNzYWdlKTtcbiAgICAgKiB9KVxuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIGFkZFNvY2tldExpc3RlbmVyKCBpZDpzdHJpbmcsaGFuZGxlcjoobWVzc2FnZToge1trZXk6c3RyaW5nXTphbnl9KT0+dm9pZCkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICB0aGlzLmxpdmVFdmVudHNbaWRdPSBoYW5kbGVyO1xuICB9XG4gIC8qKlxuICAgICAqIEdldCBsaXN0IG9mIGxpdmUgbGlzdGVuZXJzIGluIHRoZSBwcm9qZWN0XG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLmdldExpc3RlbmVycygpO1xuICAgICAqIFxuICAgICAqIE9VVFBVVDogQW4gYWxlcnQgc2hvd2luZyBsaXN0IG9mIGxpc3RlbmVyc1xuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIGdldExpc3RlbmVycygpIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgYWxlcnQoSlNPTi5zdHJpbmdpZnkoT2JqZWN0LmtleXModGhpcy5saXZlRXZlbnRzKSkpO1xuICB9XG4gIC8qKlxuICAgICAqIFNlbmRzIGEgbWVzc2FnZSB0byB0aGUgd2Vic29ja2V0XG4gICAgICogQHBhcmFtIGRhdGEgLSBBIGpzb24gb2JqZWN0IG1lc3NhZ2VcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdGhpcy5BUEkuc29ja2V0U2VuZCh7XG4gICAgICogICAgdG86IHN0dWRlbnQuaWQsXG4gICAgICogICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgKiB9KVxuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIHNvY2tldFNlbmQoZGF0YTogb2JqZWN0KSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIHRoaXMuc29ja2V0IS5vbm9wZW4gPSAoKT0+e1xuICAgICAgdGhpcy5zb2NrZXQhLnNlbmQoXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHsga2V5OiB0aGlzLmNvbmZpZz8uYXBpS2V5LCBhcHA6IHRoaXMuY29uZmlnPy5hcHAsIGRhdGE6IGRhdGEgfSlcbiAgICAgICk7XG4gICAgfVxuICB9XG4gIFxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLnNvY2tldD8uY2xvc2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgcGdFc2NhcGVTdHJpbmcoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW5wdXQgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgIH0gXG4gICAgLy8gRXNjYXBlIHNpbmdsZSBxdW90ZXMgYnkgcmVwbGFjaW5nIHRoZW0gd2l0aCB0d28gc2luZ2xlIHF1b3Rlc1xuICAgIHJldHVybiBpbnB1dC5yZXBsYWNlKC8nL2csIFwiJydcIikudHJpbSgpO1xuICB9XG5cbiAgLyoqXG4gICAgICogQnVpbGRzIGEgQ29yZUZvcm0gZnJvbSB1c2VyIGlucHV0XG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5IC0gQSBzdHJpbmcgcmVmZXJlbmNlIHRvIGZvcm0ga2V5XG4gICAgICogQHBhcmFtIHZhbHVlIC0gQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiBhIGZvcm0ga2V5XG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBcbiAgICAgKiBoYW5kbGVJbnB1dChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyl7XG4gICAgICogIHRoaXMuQVBJLmhhbmRsZUZvcm1WYWx1ZSgnZW1haWwnLCBldmVudC50YXJnZXQudmFsdWUpOyAvLyBrZXkgc2hvdWxkIGJlIGluaXRpYWxpemVkIHVzaW5nIGluaXRpYWxpemVGb3JtKClcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqIDxpbnB1dCAoY2hhbmdlKT0naGFuZGxlSW5wdXQoXCJlbWFpbFwiLCAkZXZlbnQpJyA+IFxuICAgICAqXG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgaGFuZGxlRm9ybVZhbHVlKGtleTpzdHJpbmcsIHZhbHVlOnN0cmluZyl7XG4gICAgdGhpcy5wdWJsaWNGb3JtW2tleV0gPSB2YWx1ZTsgXG4gICAgdGhpcy5jb3JlRm9ybVtrZXldID0gdGhpcy5wZ0VzY2FwZVN0cmluZyh2YWx1ZSk7XG4gIH1cbiAgIC8qKlxuICAgICAqIEJ1aWxkcyBhIENvcmVGb3JtIGZyb20gdXNlciBpbnB1dFxuICAgICAqXG4gICAgICogQHBhcmFtIGtleSAtIEEgc3RyaW5nIHJlZmVyZW5jZSB0byBmb3JtIGtleVxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogXG4gICAgICogZ2V0SW5wdXQoa2V5OnN0cmluZyl7XG4gICAgICogIHJldHVybiB0aGlzLkFQSS5nZXRGb3JtVmFsdWUoa2V5KTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqIDxkaXY+e3tnZXRJbnB1dCgnZW1haWwnKX19PC9kaXY+XG4gICAgICogXG4gICAqKi9cbiAgIGdldEZvcm1WYWx1ZShrZXk6c3RyaW5nKXtcbiAgICBpZih0aGlzLnB1YmxpY0Zvcm1ba2V5XSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdQbGVhc2UgaW5pdGlhbGl6ZSB0aGUgZm9ybSB1c2luZyBpbml0aWFsaXplRm9ybShbLi4uZmllbGRzXSknKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHVibGljRm9ybVtrZXldO1xuICB9XG5cbiAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBhIENvcmVGb3JtXG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5cyAtIEEgbGlzdCBvZiBzdHJpbmdzIHJlcHJlc2VudGluZyBmb3JtIGtleXNcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLmluaXRpYWxpemVGb3JtKFsnZW1haWwnXSk7XG4gICAgICogIFxuICAgICAqIE9VVFBVVDpcbiAgICAgKiBjb25zb2xlLmxvZyh0aGlzLkFQSS5jb3JlRm9ybSk7IFxuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIGluaXRpYWxpemVGb3JtKGtleXM6c3RyaW5nW10pe1xuICAgIHRoaXMucHVibGljRm9ybSA9IGtleXMucmVkdWNlKChwcmV2OmFueSxjdXJyOmFueSk9PntcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHByZXYsIHtbY3Vycl06Jyd9KVxuICAgIH0se30pXG4gICAgdGhpcy5jb3JlRm9ybSA9IGtleXMucmVkdWNlKChwcmV2OmFueSxjdXJyOmFueSk9PntcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHByZXYsIHtbY3Vycl06Jyd9KVxuICAgIH0se30pXG4gIH1cblxuICAvLyBVVElMSVRJRVNcbiAgLyoqXG4gICAgICogTWFyayB0aGUgc3RhdHVzIG9mIHRoZSBBUEkgYXMgbG9hZGluZ1xuICAgICAqXG4gICAgICogQHBhcmFtIGlzTG9hZGluZyAtIEEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIEFQSSBpcyBsb2FkaW5nXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBcbiAgICAgKiB0aGlzLkFQSS5zZXRMb2FkaW5nKHRydWUpXG4gICAgICogXG4gICAgICogY29uc29sZS5sb2codGhpcy5BUEkuaXNMb2FkaW5nKTtcbiAgICAgKiBcbiAgICoqL1xuICBzZXRMb2FkaW5nKGlzTG9hZGluZzpib29sZWFuKXtcbiAgICB0aGlzLmlzTG9hZGluZyA9IGlzTG9hZGluZztcbiAgfVxuXG4gIC8qKlxuICAgICAqIENyZWF0ZXMgYSBoYXNoIGZyb20gdGhlIHNlcnZlciBmb3IgZW5jcnlwdGluZyBkYXRhXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZW5jcnlwdCAtIEEgc3RyaW5nIHRvIGVuY3J5cHRcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFxuICAgICAqIHRoaXMuQVBJLnNlbmRGZWVkYmFjaygnc3VjY2VzcycsICdQdXNoZWQgZGF0YSEnKVxuICAgICAqIFxuICAgKiovXG4gICAgc2VuZEZlZWRiYWNrKHR5cGU6J3N1Y2Nlc3MnfCdlcnJvcid8J25ldXRyYWwnfCd3YXJuaW5nJyxtZXNzYWdlOnN0cmluZywgdGltZXI/Om51bWJlcil7XG4gICAgICB0aGlzLmNvcmVGZWVkYmFjayA9IHtcbiAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKHRpbWVyICE9IHVuZGVmaW5lZCkge1xuICAgICAgICBpZih0aGlzLnRpbWVvdXQpe1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNldCBhIHRpbWVyIHRvIHJlc2V0IHRoZSBzbmFja2JhciBmZWVkYmFjayBhZnRlciAyIHNlY29uZHNcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuY29yZUZlZWRiYWNrID0gdW5kZWZpbmVkO1xuICAgICAgICB9LCB0aW1lcik7XG4gICAgICB9XG4gICAgfVxuICAvKipcbiAgICAgKiBTdG9yZSBBUEkgZmVlZGJhY2sgZm9yIHNuYWNrYmFycyBhbmQgb3RoZXIgZGlzcGxheSBmZWVkYmFja1xuICAgICAqIFxuICAgICAqIEByZXR1cm5zIC0gQSBmZWVkYmFjayBvYmplY3Qgd2l0aCB7dHlwZSwgbWVzc2FnZX1cbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFxuICAgICAqIGdldEZlZWRiYWNrKCl7XG4gICAgICogICByZXR1cm4gdGhpcy5BUEkuZ2V0RmVlZGJhY2soKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqICAvLyBTbmFja2JhcnMgaW4gYXBwLmNvbXBvbmVudC50cyAocm9vdClcbiAgICAgKiAgPGRpdiBjbGFzcz0nc25hY2tiYXInICpuZ0lmPSdnZXRGZWVkYmFjaygpLnR5cGUgIT0gdW5kZWZpbmVkJz4gU29tZSBGZWVkYmFjayA8L2Rpdj5cbiAgICAgKiBcbiAgICAgKiBcbiAgICoqL1xuICAgIGdldEZlZWRiYWNrKCl7XG4gICAgICByZXR1cm4gdGhpcy5jb3JlRmVlZGJhY2s7XG4gICAgfVxuICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGhhc2ggZnJvbSB0aGUgc2VydmVyIGZvciBub24gZGVjcnlwdGFibGUgZGF0YVxuICAgICAqXG4gICAgICogQHBhcmFtIHRleHQgLSBBIHN0cmluZyB0byBlbmNyeXB0XG4gICAgICogXG4gICAgICogQHJldHVybnMgQSBzdHJpbmcgaGFzaCBvciB0aHJvd3MgYW4gZXJyb3IgaWYgYW4gZXJyb3IgaGFzIG9jY3VyZWRcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgaGFzaCA9IHRoaXMuQVBJLmhhc2goJ2tlbicpO1xuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKGhhc2gpO1xuICAgICAqIFxuICAgKiovXG4gIGFzeW5jIGhhc2godGV4dDpzdHJpbmcpe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMucG9zdCgnZ2V0X2hhc2gnLCB7dGV4dDogdGV4dH0pKVxuICAgIGlmKHJlc3BvbnNlLnN1Y2Nlc3Mpe1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm91dHB1dDtcbiAgICB9ZWxzZXtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGhhc2g6IFNlcnZlciBFcnJvcicpO1xuXG4gICAgfVxuICB9XG4gICAvKipcbiAgICAgKiBFbmNyeXB0cyBhIHRleHQgXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGV4dCAtIEEgc3RyaW5nIHRvIGVuY3J5cHRcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBBIHN0cmluZyBhbiBlbmNyeXB0ZWQgdGV4dCBvciB0aHJvd3MgYW4gZXJyb3IgaWYgYW4gZXJyb3IgaGFzIG9jY3VyZWRcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZW5jcnlwdGVkID0gdGhpcy5BUEkuZW5jcnlwdCgna2VuJyk7XG4gICAgICogXG4gICAgICogY29uc29sZS5sb2coZW5jcnlwdGVkKTtcbiAgICAgKiBcbiAgICoqL1xuICAgYXN5bmMgZW5jcnlwdCh0ZXh0OnN0cmluZyl7XG4gICAgY29uc3QgcmVzcG9uc2UgPSAgYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5wb3N0KCdlbmNyeXB0Jywge3RleHQ6IHRleHR9KSlcbiAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgIHJldHVybiByZXNwb25zZS5vdXRwdXQ7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBlbmNyeXB0OiBTZXJ2ZXIgRXJyb3InKTtcblxuICAgIH1cbiAgfVxuICAgLyoqXG4gICAgICogRGVjcnlwdCBhbiBlbmNyeXB0ZWQgdGV4dCBpbiB0aGUgc2VydmVyIHRvIGdldCBwbGFpbiB0ZXh0XG4gICAgICpcbiAgICAgKiBAcGFyYW0gZW5jcnlwdGVkIC0gQSBzdHJpbmcgdG8gZW5jcnlwdFxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIEEgc3RyaW5nIHRoZSBwbGFpbiB0ZXh0IG9mIGFuIGVuY3J5cHRlZCB0ZXh0IG9yIG9yIHRocm93cyBhbiBlcnJvciBpZiBhbiBlcnJvciBoYXMgb2NjdXJlZFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBwbGFpblRleHQgPSB0aGlzLkFQSS5kZWNyeXB0KCdBc2kxMmlVU0lEVUFJU0RVMTInKTtcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyhwbGFpblRleHQpO1xuICAgICAqIFxuICAgKiovXG4gICBhc3luYyBkZWNyeXB0KGVuY3J5cHRlZDpzdHJpbmcpe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMucG9zdCgnZGVjcnlwdCcsIHtlbmNyeXB0ZWQ6IGVuY3J5cHRlZH0pKVxuICAgIGlmKHJlc3BvbnNlLnN1Y2Nlc3Mpe1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm91dHB1dDtcbiAgICB9ZWxzZXtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGRlY3J5cHQgaGFzaDogU2VydmVyIEVycm9yJyk7XG4gICAgfVxuICB9XG4gICAvKipcbiAgICAgKiBDaGVja3MgaWYgYSB2YWx1ZSBtYXRjaGVzIGEgaGFzaFxuICAgICAqXG4gICAgICogQHBhcmFtIHRleHQgLSBBIHN0cmluZyB0byBjaGVja1xuICAgICAqIFxuICAgICAqIEBwYXJhbSBoYXNoIC0gQSBoYXNoIHN0cmluZyB0byBjaGVja1xuICAgICAqIFxuICAgICAqIEByZXR1cm5zIC0gVHJ1ZSBpZiB0ZXh0IGFuZCBoYXNoIG1hdGNoZXMsIGZhbHNlIG90aGVyd2lzZS4gVGhyb3dzIGFuIGVycm9yIGlmIGFuIGVycm9yIGhhcyBvY2N1cnJlZC5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgbWF0Y2ggPSB0aGlzLkFQSS52ZXJpZnlIYXNoKCd0ZXh0JywnJDJhYXNka2syLjEyM2kxMjNpamFzdWRma2xhanNkbGEnKTtcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyhtYXRjaCk7XG4gICAgICogXG4gICAqKi9cbiAgIGFzeW5jIHZlcmlmeUhhc2godGV4dDpzdHJpbmcsaGFzaDpzdHJpbmcpe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMucG9zdCgndmVyaWZ5X2hhc2gnLCB7dGV4dDogdGV4dCwgaGFzaDpoYXNofSkpXG4gICAgaWYocmVzcG9uc2Uuc3VjY2Vzcyl7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub3V0cHV0O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmFibGUgdG8gdmVyaWZ5IGhhc2g6IFNlcnZlciBFcnJvcicpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICAgKiBDcmVhdGVzIGEgdW5pcXVlIGlkZW50aWZpZXIgd2l0aCB0aGUgbGVuZ3RoIG9mIDMyXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBIHJhbmRvbSB1bmlxdWUgMzIgc3RyaW5nIGlkZW50aWZpZXJcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgaWQgPSB0aGlzLkFQSS5jcmVhdGVVbmlxdWVJRDMyKCk7XG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgY3JlYXRlVW5pcXVlSUQzMigpIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgY29uc3QgdGltZXN0YW1wID0gRGF0ZS5ub3coKS50b1N0cmluZygxNik7IC8vIEdldCBjdXJyZW50IHRpbWUgaW4gaGV4XG4gICAgICBjb25zdCByYW5kb21QYXJ0ID0gJ3h4eHh4eHh4eHh4eHh4eHgnLnJlcGxhY2UoL3gvZywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIDE2IHwgMCkudG9TdHJpbmcoMTYpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGltZXN0YW1wICsgcmFuZG9tUGFydC5zbGljZSgwLCAxNik7IC8vIENvbWJpbmUgdGltZXN0YW1wIHdpdGggcmFuZG9tIHBhcnRcbiAgfVxuXG4gIHByaXZhdGUgcG9zdChtZXRob2Q6IHN0cmluZywgYm9keToge30pIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgZm9yICh2YXIgW2tleSwgb2JqXSBvZiBPYmplY3QuZW50cmllczxhbnk+KGJvZHkpKSB7XG4gICAgICBpZiAoa2V5ID09ICd2YWx1ZXMnKSB7XG4gICAgICAgIGZvciAodmFyIFtmaWVsZCwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKG9iaikpIHtcbiAgICAgICAgICBvYmpbZmllbGRdID0gdmFsdWUgPz8gJyc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyh7XG4gICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6ICdYTUxIdHRwUmVxdWVzdCcsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0pO1xuICAgIGNvbnN0IHNhbHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3Q8YW55PihcbiAgICAgIHRoaXMuY29uZmlnPy5hcGkgKyAnPycgKyBzYWx0LFxuICAgICAgSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAge1xuICAgICAgICAgICAgQVBJX0tFWTogdGhpcy5jb25maWc/LmFwaUtleSxcbiAgICAgICAgICAgIEFwcDogdGhpcy5jb25maWc/LmFwcCxcbiAgICAgICAgICAgIE1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYm9keVxuICAgICAgICApXG4gICAgICApLFxuICAgICAgeyBoZWFkZXJzIH1cbiAgICApO1xuICB9XG5cbiAgXG4gIC8vIENSRUFURSBSRUFEIFVQREFURSBBTkQgREVMRVRFIEhBTkRMRVJTXG5cbiAgLyoqXG4gICAgICogUnVucyBhbiBpbnNlcnQgcXVlcnkgdG8gdGhlIHNlcnZlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwb3N0T2JqZWN0IC0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGFibGVzLCBhbmQgdmFsdWVzIGZvciB0aGUgU1FMIHF1ZXJ5LlxuICAgICAqIEByZXR1cm5zIEEgcmVzcG9zZSBvYmplY3QgXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGRldGFpbHMucGFzc3dvcmQgPSB0aGlzLkFQSS5oYXNoKGRldGFpbHMucGFzc3dvcmQpO1xuICAgICAqIFxuICAgICAqIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLkFQSS5jcmVhdGUoe1xuICAgICAqICAgdGFibGVzOiAnYWRtaW4nLFxuICAgICAqICAgdmFsdWVzOiB7XG4gICAgICogICAgJ2VtYWlsJzp0aGlzLkFQSS5jb3JlRm9ybVsnZW1haWwnXSxcbiAgICAgKiAgICAncGFzc3dvcmQnOiB0aGlzLkFQSS5jb3JlRm9ybVsncGFzc3dvcmQnXSwgXG4gICAgICogIH0sXG4gICAgICogfSk7XG4gICAgICogXG4gICAgICogaWYoZGF0YS5zdWNjZXNzKXtcbiAgICAgKiAgY29uc29sZS5sb2coZGF0YS5vdXRwdXQpO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICoqL1xuICBhc3luYyBjcmVhdGUocG9zdE9iamVjdDpDb3JlQ3JlYXRlT2JqZWN0KTpQcm9taXNlPENvcmVSZXNwb25zZT57XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIHJldHVybiAgYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5wb3N0KCdjcmVhdGVfZW50cnknLCB7XG4gICAgICAnZGF0YSc6IEpTT04uc3RyaW5naWZ5KHBvc3RPYmplY3QpLFxuICAgIH0pKTtcbiAgfVxuXG4gIC8qKlxuICAgICAqIFJ1bnMgYW4gcmVhZCBxdWVyeSB0byB0aGUgc2VydmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHBvc3RPYmplY3QgLSBBbiBvYmplY3QgY29udGFpbmluZyBzZWxlY3RvcnMsIHRhYmxlcywgYW5kIGNvbmRpdGlvbnMgZm9yIHRoZSBTUUwgcXVlcnkuXG4gICAgICogQHJldHVybnMgQSByZXNwb3NlIG9iamVjdCBcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuQVBJLnJlYWQoe1xuICAgICAqICAgc2VsZWN0b3JzOiBbXG4gICAgICogICAgICdmX2FkbWluLklEJyxcbiAgICAgKiAgICAgJ1VzZXJuYW1lJyxcbiAgICAgKiAgICAgJ0VtYWlsJyxcbiAgICAgKiAgICAgJ0NPVU5UKGZfbWVzc2FnZXMuSUQpIGFzIGluYm94J1xuICAgICAqICAgXSxcbiAgICAgKiAgIHRhYmxlczogJ2ZfYWRtaW4nLFxuICAgICAqICAgY29uZGl0aW9uczogYFdIRVJFIGVtYWlsID0gJHt0aGlzLkFQSS5jb3JlRm9ybVsnZW1haWwnXX1gXG4gICAgICogfSk7XG4gICAgICogXG4gICAgICogaWYoZGF0YS5zdWNjZXNzICYmIGRhdGEub3V0cHV0Lmxlbmd0aCA+IDApe1xuICAgICAqIC8vIHNpbmdsZSBvdXRwdXRcbiAgICAgKiAgY29uc29sZS5sb2coZGF0YS5vdXRwdXRbMF0pO1xuICAgICAqIC8vIGFsbCBvdXR0cHV0XG4gICAgICogIGZvcihsZXQgcm93IG9mIGRhdGEub3V0cHV0KXtcbiAgICAgKiAgICBjb25zb2xlLmxvZyhyb3cpO1xuICAgICAqICB9XG4gICAgICogfVxuICAgICAqIFxuICAgKiovXG4gIGFzeW5jIHJlYWQocG9zdE9iamVjdDpDb3JlUmVhZE9iamVjdCk6UHJvbWlzZTxDb3JlUmVzcG9uc2U+e1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICByZXR1cm4gYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5wb3N0KCdnZXRfZW50cmllcycsIHtcbiAgICAgICdkYXRhJzogSlNPTi5zdHJpbmdpZnkocG9zdE9iamVjdCksXG4gICAgfSkpO1xuICB9XG4gICAvKipcbiAgICAgKiBSdW5zIGFuIHVwZGF0ZSBxdWVyeSB0byB0aGUgc2VydmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHBvc3RPYmplY3QgLSBBbiBvYmplY3QgY29udGFpbmluZyBzZWxlY3RvcnMsIHZhbHVlcyAsdGFibGVzLCBhbmQgY29uZGl0aW9ucyBmb3IgdGhlIFNRTCBxdWVyeS5cbiAgICAgKiBAcmV0dXJucyBBIHJlc3Bvc2Ugb2JqZWN0IFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBlbmNyeXB0ZWQgPSB0aGlzLkFQSS5oYXNoKHRoaXMuQVBJLmNvcmVGb3JtWydwYXNzd29yZCddKTtcbiAgICAgKiBcbiAgICAgKiBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5BUEkudXBkYXRlKHtcbiAgICAgKiAgIHRhYmxlczogJ2ZfYWRtaW4nLFxuICAgICAqICAgdmFsdWVzOiB7XG4gICAgICogICAgJ2VtYWlsJzp0aGlzLkFQSS5jb3JlRm9ybVsnZW1haWwnXSxcbiAgICAgKiAgICAncGFzc3dvcmQnOiBlbmNyeXB0ZWQsIFxuICAgICAqICAgfSxcbiAgICAgKiAgIGNvbmRpdGlvbnM6IGBXSEVSRSBlbWFpbCA9ICR7dGhpcy5BUEkuY29yZUZvcm1bJ2VtYWlsJ119YFxuICAgICAqIH0pO1xuICAgICAqIFxuICAgICAqIGlmKGRhdGEuc3VjY2Vzcyl7XG4gICAgICogICBjb25zb2xlLmxvZyhkYXRhLm91dHB1dCk7XG4gICAgICogfVxuICAgICAqIFxuICAgKiovXG4gIGFzeW5jIHVwZGF0ZShwb3N0T2JqZWN0OkNvcmVVcGRhdGVPYmplY3QpOlByb21pc2U8Q29yZVJlc3BvbnNlPntcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICByZXR1cm4gZmlyc3RWYWx1ZUZyb20oIHRoaXMucG9zdCgndXBkYXRlX2VudHJ5Jywge1xuICAgICdkYXRhJzogSlNPTi5zdHJpbmdpZnkocG9zdE9iamVjdCksXG4gIH0pKTtcbiAgfVxuXG4gIC8qKlxuICAgICAqIFJ1bnMgYW4gZGVsZXRlIHF1ZXJ5IHRvIHRoZSBzZXJ2ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcG9zdE9iamVjdCAtIEFuIG9iamVjdCBjb250YWluaW5nIHRhYmxlcywgYW5kIGNvbmRpdGlvbnMgZm9yIHRoZSBTUUwgcXVlcnkuXG4gICAgICogQHJldHVybnMgQSByZXNwb3NlIG9iamVjdCBcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuQVBJLmRlbGV0ZSh7XG4gICAgICogICB0YWJsZXM6ICdmX2FkbWluJyxcbiAgICAgKiAgIGNvbmRpdGlvbnM6IGBXSEVSRSBlbWFpbCA9ICR7dGhpcy5BUEkuY29yZUZvcm1bJ2VtYWlsJ119YFxuICAgICAqIH0pO1xuICAgICAqIFxuICAgICAqIGlmKGRhdGEuc3VjY2Vzcyl7XG4gICAgICogICBjb25zb2xlLmxvZyhkYXRhLm91dHB1dCk7XG4gICAgICogfVxuICAgICAqIFxuICAgKiovXG4gIGFzeW5jIGRlbGV0ZShwb3N0T2JqZWN0OkNvcmVEZWxldGVPYmplY3QpOlByb21pc2U8Q29yZVJlc3BvbnNlPntcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMucG9zdCgnZGVsZXRlX2VudHJ5Jywge1xuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkocG9zdE9iamVjdCksXG4gICAgfSkpXG4gIH1cblxuICAvLyBGSUxFIEhBTkRMRVJTXG5cbiAgIC8qKlxuICAgICAqIEdldCBjb21wbGV0ZSBmaWxlIFVSTCBmcm9tIHRoZSBzZXJ2ZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSBmaWxlIC0gQSBzdHJpbmcgdGhhdCBwb2ludHMgdG8gdGhlIGZpbGUuXG4gICAgICogQHJldHVybnMgQSBjb21wbGV0ZSB1cmwgc3RyaW5nIGZyb20gdGhlIHNlcnZlciBcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgdXJsID0gdGhpcy5BUEkuZ2V0RmlsZVVSTCgnZmlsZXMvcHJvZmlsZS5wbmcnKTtcbiAgICAgKiBcbiAgICAgKiBPVVRQVVQ6XG4gICAgICogIGh0dHBzOi8vbG9jYWxob3N0OjgwODAvZmlsZXMvcHJvZmlsZS5wbmdcbiAgICAgKiBcbiAgICoqL1xuICBnZXRGaWxlVVJMKGZpbGU6IHN0cmluZyk6c3RyaW5nfHVuZGVmaW5lZCB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KFwiUGxlYXNlIGluaXRpYWxpemUgdXN3YWdvbiBjb3JlIG9uIHJvb3QgYXBwLmNvbXBvbmVudC50c1wiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGZpbGUpIHtcbiAgICAgIGlmIChmaWxlLmluY2x1ZGVzKCdodHRwJykpIHJldHVybiBmaWxlO1xuICAgICAgcmV0dXJuIHRoaXMuY29uZmlnPy5zZXJ2ZXIgKyBgLyR7dGhpcy5jb25maWcuYXBwfS9gICsgZmlsZSA7XG4gICAgfVxuICAgIHJldHVybiBmaWxlO1xuICB9XG5cbiAgIC8qKlxuICAgICAqIFVwbG9hZHMgYSBmaWxlIHRvIHRoZSBzZXJ2ZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSBmaWxlIC0gQSBGaWxlIHRvIHVwbG9hZFxuICAgICAqIEBwYXJhbSBmaWxlbmFtZSAtIEEgc3RyaW5nIHRoYXQgcG9pbnRzIHRvIHdoZXJlIHRoZSBmaWxlIHRvIGJlIHN0b3JlZCBpbiB0aGUgc2VydmVyXG4gICAgICogQHBhcmFtIGNodW5rU2l6ZSAtIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgbnVtYmVyIG9mIGJ5dGVzIHRvIHVwbG9hZCBwZXIgY2h1bmtcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogXG4gICAgICogZ2V0VXBsb2FkUHJvZ3Jlc3MoKXtcbiAgICAgKiAgcmV0dXJuIHRoaXMuQVBJLnVwbG9hZFByb2dyZXNzXG4gICAgICogfVxuICAgICAqIFxuICAgICAqIGF3YWl0IHRoaXMuQVBJLnVwbG9hZEZpbGUoc29tZWZpbGUsICdmaWxlcy9wcm9maWxlLnBuZycpO1xuICAgICAqIFxuICAgICAqIE9VVFBVVDpcbiAgICAgKiA8ZGl2Pnt7Z2V0VXBsb2FkUHJvZ3Jlc3MoKX19PGRpdj4gLy8gZHluYW1pY2FsbHkgdXBkYXRlcyB0aGUgcHJvZ3Jlc3NcbiAgICoqL1xuICB1cGxvYWRGaWxlKGZpbGU6IEZpbGUsIGZpbGVuYW1lOiBzdHJpbmcsIGNodW5rU2l6ZTogbnVtYmVyID0gMTAyNCAqIDEwMjQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoXCJQbGVhc2UgaW5pdGlhbGl6ZSB1c3dhZ29uIGNvcmUgb24gcm9vdCBhcHAuY29tcG9uZW50LnRzXCIpO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpPT57cmV0dXJuIG51bGx9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHRvdGFsQ2h1bmtzID0gTWF0aC5jZWlsKGZpbGUuc2l6ZSAvIGNodW5rU2l6ZSk7XG4gICAgICBsZXQgdXBsb2FkZWRDaHVua3MgPSAwOyAvLyBUcmFjayB1cGxvYWRlZCBjaHVua3NcblxuICAgICAgY29uc3QgdXBsb2FkQ2h1bmsgPSAoY2h1bmtJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gY2h1bmtJbmRleCAqIGNodW5rU2l6ZTtcbiAgICAgICAgY29uc3QgZW5kID0gTWF0aC5taW4oc3RhcnQgKyBjaHVua1NpemUsIGZpbGUuc2l6ZSk7XG4gICAgICAgIGNvbnN0IGNodW5rID0gZmlsZS5zbGljZShzdGFydCwgZW5kKTtcblxuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICByZWFkZXIub25sb2FkZW5kID0gKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGJhc2U2NFN0cmluZyA9IChyZWFkZXIucmVzdWx0IGFzIHN0cmluZykuc3BsaXQoJywnKVsxXTtcblxuICAgICAgICAgIGNvbnN0ICRzdWIgPSB0aGlzLmh0dHBcbiAgICAgICAgICAgIC5wb3N0KHRoaXMuY29uZmlnPy5ub2Rlc2VydmVyICsgJy9maWxlaGFuZGxlci1wcm9ncmVzcycsIHtcbiAgICAgICAgICAgICAga2V5OiB0aGlzLmNvbmZpZz8uYXBpS2V5LFxuICAgICAgICAgICAgICBhcHA6IHRoaXMuY29uZmlnPy5hcHAsXG4gICAgICAgICAgICAgIG1ldGhvZDogJ2NyZWF0ZV91cmwnLFxuICAgICAgICAgICAgICBjaHVuazogYmFzZTY0U3RyaW5nLFxuICAgICAgICAgICAgICBmaWxlTmFtZTogIGZpbGVuYW1lLFxuICAgICAgICAgICAgICBjaHVua0luZGV4OiBjaHVua0luZGV4LFxuICAgICAgICAgICAgICB0b3RhbENodW5rczogdG90YWxDaHVua3MsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgICAgICAgIG5leHQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICB1cGxvYWRlZENodW5rcysrO1xuICAgICAgICAgICAgICAgIHRoaXMudXBsb2FkUHJvZ3Jlc3MgPSBNYXRoLnJvdW5kKCh1cGxvYWRlZENodW5rcyAvIHRvdGFsQ2h1bmtzKSAqIDEwMCk7XG4gICAgICAgICAgICAgICAgaWYgKGNodW5rSW5kZXggKyAxIDwgdG90YWxDaHVua3MpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFVwbG9hZCBuZXh0IGNodW5rXG4gICAgICAgICAgICAgICAgICB1cGxvYWRDaHVuayhjaHVua0luZGV4ICsgMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGBGaWxlIHVwbG9hZCBjb21wbGV0ZTogJHtmaWxlbmFtZX1gKTtcbiAgICAgICAgICAgICAgICAgIHRoaXMudXBsb2FkUHJvZ3Jlc3MgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAkc3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAgICAgICByZXNvbHZlKCk7IC8vIFJlc29sdmUgdGhlIHByb21pc2Ugd2hlbiB0aGUgdXBsb2FkIGlzIGNvbXBsZXRlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBlcnJvcjogKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICRzdWIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmVycm9yKCdFcnJvciB1cGxvYWRpbmcgY2h1bmsnLCBlcnIpO1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpOyAvLyBSZWplY3QgdGhlIHByb21pc2Ugb24gZXJyb3JcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGNodW5rKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFN0YXJ0IHVwbG9hZGluZyB0aGUgZmlyc3QgY2h1bmtcbiAgICAgIHVwbG9hZENodW5rKDApO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZGlzcG9zZUZpbGUoZmlsZW5hbWU6IHN0cmluZyl7XG4gICAgICBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLmh0dHBcbiAgICAgIC5wb3N0KHRoaXMuY29uZmlnPy5ub2Rlc2VydmVyICsgJy9maWxlaGFuZGxlci1wcm9ncmVzcycsIHtcbiAgICAgICAga2V5OiB0aGlzLmNvbmZpZz8uYXBpS2V5LFxuICAgICAgICBhcHA6IHRoaXMuY29uZmlnPy5hcHAsXG4gICAgICAgIG1ldGhvZDogJ2RlbGV0ZV91cmwnLFxuICAgICAgICBmaWxlTmFtZTogIGZpbGVuYW1lLFxuICAgICAgfSkpXG4gICAgICA7XG4gIH07XG4gIFxufVxuIl19