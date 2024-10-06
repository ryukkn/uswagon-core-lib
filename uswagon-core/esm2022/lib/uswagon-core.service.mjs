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
                        app: this.config?.app,
                        method: 'create_url',
                        chunk: base64String,
                        fileName: `${this.config?.app}/` + filename,
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonCoreService, deps: [{ token: i1.HttpClient }, { token: i2.Router }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonCoreService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonCoreService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: i2.Router }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1jb3JlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWNvcmUvc3JjL2xpYi91c3dhZ29uLWNvcmUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBYSxNQUFNLGVBQWUsQ0FBQztBQUd0RCxPQUFPLEVBQUcsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBS3ZDLE1BQU0sT0FBTyxrQkFBa0I7SUFrQzdCLFlBQ1UsSUFBZ0IsRUFDaEIsTUFBYztRQURkLFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQXRCaEIsZUFBVSxHQUFZLEVBQUUsQ0FBQTtRQUMvQjs7Ozs7Ozs7Ozs7V0FXRztRQUNHLGFBQVEsR0FBWSxFQUFFLENBQUE7UUFJckIsZUFBVSxHQUFxRCxFQUFFLENBQUM7SUFNdEUsQ0FBQztJQUVMLGlCQUFpQjtJQUNqQjs7Ozs7Ozs7Ozs7OztRQWFJO0lBQ0osVUFBVSxDQUFDLE1BQWlCO1FBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLGFBQWEsQ0FBQztRQUN2QyxJQUFJLENBQUMsTUFBTyxDQUFDLFNBQVMsR0FBRyxDQUFDLE9BQU8sRUFBQyxFQUFFO1lBQ2xDLElBQUksY0FBYyxHQUFHLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENB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Q0FBQyxDQUFDLENBQUMsOEJBQThCO3dCQUM3QyxDQUFDO3FCQUNGLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUM7Z0JBRUYsTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUM7WUFFRixrQ0FBa0M7WUFDbEMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzsrR0F0bkJVLGtCQUFrQjttSEFBbEIsa0JBQWtCLGNBRmpCLE1BQU07OzRGQUVQLGtCQUFrQjtrQkFIOUIsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwSGVhZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IEluamVjdGFibGUsIE9uRGVzdHJveSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IENvcmVDb25maWcsIENvcmVDcmVhdGVPYmplY3QsIENvcmVEZWxldGVPYmplY3QsIENvcmVGb3JtLCBDb3JlUmVhZE9iamVjdCwgQ29yZVJlc3BvbnNlLCBDb3JlVXBkYXRlT2JqZWN0LCBTbmFja2JhckNvcmVGZWVkYmFjayB9IGZyb20gJy4vdHlwZXMvdXN3YWdvbi1jb3JlLnR5cGVzJztcbmltcG9ydCB7ICBmaXJzdFZhbHVlRnJvbSB9IGZyb20gJ3J4anMnO1xuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290J1xufSlcbmV4cG9ydCBjbGFzcyBVc3dhZ29uQ29yZVNlcnZpY2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAgLyoqXG4gICAgICogVXBsb2FkIHByb2dyZXNzIGluZGljYXRvciBvbiBjdXJyZW50IGZpbGUgdXBsb2FkXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBnZXRVcGxvYWRQcm9ncmVzcygpe1xuICAgICAqICByZXR1cm4gdGhpcy5BUEkudXBsb2FkUHJvZ3Jlc3M7XG4gICAgICogfVxuICAgICAqICBcbiAgICoqL1xuICBwdWJsaWMgdXBsb2FkUHJvZ3Jlc3M/Om51bWJlcjtcblxuICBwcml2YXRlIGNvcmVGZWVkYmFjaz86U25hY2tiYXJDb3JlRmVlZGJhY2s7XG5cbiAgcHJpdmF0ZSBwdWJsaWNGb3JtOkNvcmVGb3JtID0ge31cbiAgIC8qKlxuICAgICAqIFNlY3VyZSBmb3JtIGZvciBzdG9yaW5nIG1vcmUgc2VjdXJlIGlucHV0XG4gICAgICogXG4gICAgICogTk9URTogVGhpcyBpcyB0aGUgZm9ybSB0aGF0IHNob3VsZCBiZSB1c2VkIHdoZW4gYnVpbGRpbmcgcG9zdE9iamVjdHNcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGZvcihsZXQga2V5IGluIHRoaXMuQVBJLmNvcmVGb3JtKXtcbiAgICAgKiAgLy8gcHJvY2VzcyB2YWx1ZVxuICAgICAqICBjb25zb2xlLmxvZyh0aGlzLkFQSS5jb3JlRm9ybVtrZXldKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAqKi9cbiAgcHVibGljIGNvcmVGb3JtOkNvcmVGb3JtID0ge31cbiAgXG4gIHByaXZhdGUgc29ja2V0PzogV2ViU29ja2V0O1xuICBwcml2YXRlIGNvbmZpZz86IENvcmVDb25maWc7XG4gIHByaXZhdGUgbGl2ZUV2ZW50czp7W2tleTogc3RyaW5nXTogKG1lc3NhZ2U6IE1lc3NhZ2VFdmVudCkgPT4gdm9pZCB9ID0ge307XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcbiAgKSB7IH1cblxuICAvLyBJTklUSUFMSVpBVElPTlxuICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgc2VydmljZSBmb3IgdGhlIHByb2plY3RcbiAgICAgKiBAcGFyYW0gY29uZmlnIC0gY29uZmlndXJhdGlvbiB0aGF0IHBvaW50cyB0aGUgc2VydmljZSB0byBpdHMgYXBwcm9wcmlhdGUgc2VydmVyXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0aGlzLkFQSS5pbml0aWFsaXplKHtcbiAgICAgKiAgYXBpOmVudmlyb25tZW50LmFwaSxcbiAgICAgKiAgYXBpS2V5OiBlbnZpcm9ubWVudC5hcGlLZXksXG4gICAgICogIG5vZGVzZXJ2ZXI6IGVudmlyb25tZW50Lm5vZGVzZXJ2ZXIsXG4gICAgICogIHNlcnZlcjogZW52aXJvbm1lbnQuc2VydmVyLFxuICAgICAqICBzb2NrZXQ6IGVudmlyb25tZW50LnNvY2tldFxuICAgICAqIH0pXG4gICAgICogXG4gICAqKi9cbiAgaW5pdGlhbGl6ZShjb25maWc6Q29yZUNvbmZpZyl7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KGNvbmZpZy5zb2NrZXQpO1xuICAgIHRoaXMuc29ja2V0LmJpbmFyeVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICAgIHRoaXMuc29ja2V0IS5vbm1lc3NhZ2UgPSAobWVzc2FnZSk9PntcbiAgICAgIHZhciBkZWNvZGVkTWVzc2FnZSA9IG5ldyBUZXh0RGVjb2RlcigndXRmLTgnKS5kZWNvZGUobWVzc2FnZS5kYXRhKTtcbiAgICAgIGNvbnN0IHNvY2tldERhdGEgPSBKU09OLnBhcnNlKGRlY29kZWRNZXNzYWdlKTtcbiAgICAgIGlmKHNvY2tldERhdGEuYXBwICE9IGNvbmZpZy5hcHApIHJldHVybjtcbiAgICAgIGZvciAoY29uc3QgaWQgaW4gdGhpcy5saXZlRXZlbnRzKSB7XG4gICAgICAgICAgdGhpcy5saXZlRXZlbnRzW2lkXShzb2NrZXREYXRhLmRhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gICAvKipcbiAgICAgKiBBZGQgYSBuZXcgbGl2ZSBsaXN0ZW5lciBmcm9tIHRoZSBzZXJ2ZXIncyB3ZWJzb2NrZXRcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gaWQgLSBVbmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIGxpc3RlbmVycyB0byBhdm9pZCBjb2xsaXNpb25zXG4gICAgICogQHBhcmFtIGhhbmRsZXIgLSBXZWJzb2NrZXQgbWVzc2FnZXMgYXJlIHBhc3NlZCB0byB0aGlzIGhhbmRsZXJcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdGhpcy5BUEkuYWRkTGl2ZUxpc3RlbmVyKCdldmVudC0xJywobWVzc2FnZTp7W2tleTpzdHJpbmddOmFueX0pPT57XG4gICAgICogIE9VVFBVVDpcbiAgICAgKiAgLy8gc2FtZSBhcyB0aGUganNvbiBzZW50IGZyb20gc29ja2V0U2VuZChkYXRhKVxuICAgICAqICAvLyBsb2dpY3MgYXJlIGFwcGxpZWQgaGVyZSBzbyB0aGF0IG1lc3NhZ2VzIGFyZSBvbmx5IHJlY2VpdmVkIG9uIHNwZWNpZmljIGNsaWVudHNcbiAgICAgKiAgY29uc29sZS5sb2cobWVzc2FnZSk7XG4gICAgICogfSlcbiAgICAgKiBcbiAgICAgKiBcbiAgICoqL1xuICBhZGRTb2NrZXRMaXN0ZW5lciggaWQ6c3RyaW5nLGhhbmRsZXI6KG1lc3NhZ2U6IHtba2V5OnN0cmluZ106YW55fSk9PnZvaWQpIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgdGhpcy5saXZlRXZlbnRzW2lkXT0gaGFuZGxlcjtcbiAgfVxuICAvKipcbiAgICAgKiBHZXQgbGlzdCBvZiBsaXZlIGxpc3RlbmVycyBpbiB0aGUgcHJvamVjdFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0aGlzLkFQSS5nZXRMaXN0ZW5lcnMoKTtcbiAgICAgKiBcbiAgICAgKiBPVVRQVVQ6IEFuIGFsZXJ0IHNob3dpbmcgbGlzdCBvZiBsaXN0ZW5lcnNcbiAgICAgKiBcbiAgICAgKiBcbiAgICoqL1xuICBnZXRMaXN0ZW5lcnMoKSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIGFsZXJ0KEpTT04uc3RyaW5naWZ5KE9iamVjdC5rZXlzKHRoaXMubGl2ZUV2ZW50cykpKTtcbiAgfVxuICAvKipcbiAgICAgKiBTZW5kcyBhIG1lc3NhZ2UgdG8gdGhlIHdlYnNvY2tldFxuICAgICAqIEBwYXJhbSBkYXRhIC0gQSBqc29uIG9iamVjdCBtZXNzYWdlXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLnNvY2tldFNlbmQoe1xuICAgICAqICAgIHRvOiBzdHVkZW50LmlkLFxuICAgICAqICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICogfSlcbiAgICAgKiBcbiAgICAgKiBcbiAgICoqL1xuICBzb2NrZXRTZW5kKGRhdGE6IG9iamVjdCkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICB0aGlzLnNvY2tldCEub25vcGVuID0gKCk9PntcbiAgICAgIHRoaXMuc29ja2V0IS5zZW5kKFxuICAgICAgICBKU09OLnN0cmluZ2lmeSh7IGtleTogdGhpcy5jb25maWc/LmFwaUtleSwgZGF0YTogZGF0YSB9KVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuc29ja2V0Py5jbG9zZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBwZ0VzY2FwZVN0cmluZyhpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodHlwZW9mIGlucHV0ICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnB1dCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgfSBcbiAgICAvLyBFc2NhcGUgc2luZ2xlIHF1b3RlcyBieSByZXBsYWNpbmcgdGhlbSB3aXRoIHR3byBzaW5nbGUgcXVvdGVzXG4gICAgcmV0dXJuIGlucHV0LnJlcGxhY2UoLycvZywgXCInJ1wiKTtcbiAgfVxuXG4gIC8qKlxuICAgICAqIEJ1aWxkcyBhIENvcmVGb3JtIGZyb20gdXNlciBpbnB1dFxuICAgICAqXG4gICAgICogQHBhcmFtIGtleSAtIEEgc3RyaW5nIHJlZmVyZW5jZSB0byBmb3JtIGtleVxuICAgICAqIEBwYXJhbSB2YWx1ZSAtIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgYSBmb3JtIGtleVxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogXG4gICAgICogaGFuZGxlSW5wdXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpe1xuICAgICAqICB0aGlzLkFQSS5oYW5kbGVGb3JtVmFsdWUoJ2VtYWlsJywgZXZlbnQudGFyZ2V0LnZhbHVlKTsgLy8ga2V5IHNob3VsZCBiZSBpbml0aWFsaXplZCB1c2luZyBjcmVhdGVGb3JtKClcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqIDxpbnB1dCAoY2hhbmdlKT0naGFuZGxlSW5wdXQoXCJlbWFpbFwiLCAkZXZlbnQpJyA+IFxuICAgICAqXG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgaGFuZGxlRm9ybVZhbHVlKGtleTpzdHJpbmcsIHZhbHVlOnN0cmluZyl7XG4gICAgdGhpcy5wdWJsaWNGb3JtW2tleV0gPSB2YWx1ZTsgXG4gICAgdGhpcy5jb3JlRm9ybVtrZXldID0gdGhpcy5wZ0VzY2FwZVN0cmluZyh2YWx1ZSk7XG4gIH1cbiAgIC8qKlxuICAgICAqIEJ1aWxkcyBhIENvcmVGb3JtIGZyb20gdXNlciBpbnB1dFxuICAgICAqXG4gICAgICogQHBhcmFtIGtleSAtIEEgc3RyaW5nIHJlZmVyZW5jZSB0byBmb3JtIGtleVxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogXG4gICAgICogZ2V0SW5wdXQoa2V5OnN0cmluZyl7XG4gICAgICogIHJldHVybiB0aGlzLkFQSS5nZXRGb3JtVmFsdWUoa2V5KTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqIDxkaXY+e3tnZXRJbnB1dCgnZW1haWwnKX19PC9kaXY+XG4gICAgICogXG4gICAqKi9cbiAgIGdldEZvcm1WYWx1ZShrZXk6c3RyaW5nKXtcbiAgICBpZih0aGlzLnB1YmxpY0Zvcm1ba2V5XSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdQbGVhc2UgaW5pdGlhbGl6ZSB0aGUgZm9ybSB1c2luZyBjcmVhdGVGb3JtKFtmb3JtXSknKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHVibGljRm9ybVtrZXldO1xuICB9XG5cbiAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBhIENvcmVGb3JtXG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5cyAtIEEgbGlzdCBvZiBzdHJpbmdzIHJlcHJlc2VudGluZyBmb3JtIGtleXNcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLmNyZWF0ZUZvcm0oWydlbWFpbCddKTtcbiAgICAgKiAgXG4gICAgICogT1VUUFVUOlxuICAgICAqIGNvbnNvbGUubG9nKHRoaXMuQVBJLmNvcmVGb3JtKTsgXG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgY3JlYXRlRm9ybShrZXlzOnN0cmluZ1tdKXtcbiAgICB0aGlzLnB1YmxpY0Zvcm0gPSBrZXlzLnJlZHVjZSgocHJldjphbnksY3VycjphbnkpPT57XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihwcmV2LCB7W2N1cnJdOicnfSlcbiAgICB9LHt9KVxuICAgIHRoaXMuY29yZUZvcm0gPSBrZXlzLnJlZHVjZSgocHJldjphbnksY3VycjphbnkpPT57XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihwcmV2LCB7W2N1cnJdOicnfSlcbiAgICB9LHt9KVxuICB9XG5cbiAgLy8gVVRJTElUSUVTXG4gIC8qKlxuICAgICAqIENyZWF0ZXMgYSBoYXNoIGZyb20gdGhlIHNlcnZlciBmb3IgZW5jcnlwdGluZyBkYXRhXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZW5jcnlwdCAtIEEgc3RyaW5nIHRvIGVuY3J5cHRcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFxuICAgICAqIHRoaXMuQVBJLnNlbmRGZWVkYmFjaygnc3VjY2VzJywgJ1B1c2hlZCBkYXRhIScpXG4gICAgICogXG4gICAqKi9cbiAgICBzZW5kRmVlZGJhY2sodHlwZTonc3VjY2Vzcyd8J2Vycm9yJ3wnbmV1dHJhbCd8J3dhcm5pbmcnLG1lc3NhZ2U6c3RyaW5nLCB0aW1lcj86bnVtYmVyKXtcbiAgICAgIHRoaXMuY29yZUZlZWRiYWNrID0ge1xuICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAodGltZXIgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIFNldCBhIHRpbWVyIHRvIHJlc2V0IHRoZSBzbmFja2JhciBmZWVkYmFjayBhZnRlciAyIHNlY29uZHNcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5jb3JlRmVlZGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgICAgIH0sIHRpbWVyKTtcbiAgICAgIH1cbiAgICB9XG4gIC8qKlxuICAgICAqIFN0b3JlIEFQSSBmZWVkYmFjayBmb3Igc25hY2tiYXJzIGFuZCBvdGhlciBkaXNwbGF5IGZlZWRiYWNrXG4gICAgICogXG4gICAgICogQHJldHVybnMgLSBBIGZlZWRiYWNrIG9iamVjdCB3aXRoIHt0eXBlLCBtZXNzYWdlfVxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogXG4gICAgICogZ2V0RmVlZGJhY2soKXtcbiAgICAgKiAgIHJldHVybiB0aGlzLkFQSS5nZXRGZWVkYmFjaygpO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBPVVRQVVQ6XG4gICAgICogIC8vIFNuYWNrYmFycyBpbiBhcHAuY29tcG9uZW50LnRzIChyb290KVxuICAgICAqICA8ZGl2IGNsYXNzPSdzbmFja2JhcicgKm5nSWY9J2dldEZlZWRiYWNrKCkudHlwZSAhPSB1bmRlZmluZWQnPiBTb21lIEZlZWRiYWNrIDwvZGl2PlxuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gICAgZ2V0RmVlZGJhY2soKXtcbiAgICAgIHJldHVybiB0aGlzLmNvcmVGZWVkYmFjaztcbiAgICB9XG4gICAvKipcbiAgICAgKiBDcmVhdGVzIGEgaGFzaCBmcm9tIHRoZSBzZXJ2ZXIgZm9yIG5vbiBkZWNyeXB0YWJsZSBkYXRhXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGV4dCAtIEEgc3RyaW5nIHRvIGVuY3J5cHRcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBBIHN0cmluZyBoYXNoIG9yIG51bGwgaWYgYW4gZXJyb3IgaGFzIG9jY3VyZWRcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgaGFzaCA9IHRoaXMuQVBJLmhhc2goJ2tlbicpO1xuICAgICAqIGlmKGhhc2gpe1xuICAgICAqICBjb25zb2xlLmxvZyhoYXNoKTtcbiAgICAgKiB9ZWxzZXtcbiAgICAgKiAgY29uc29sZS5sb2coJ0VSUk9SJyk7XG4gICAgICogfVxuICAgICAqIFxuICAgKiovXG4gIGFzeW5jIGhhc2godGV4dDpzdHJpbmcpe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMucG9zdCgnZ2V0X2hhc2gnLCB7dGV4dDogdGV4dH0pKVxuICAgIGlmKHJlc3BvbnNlLnN1Y2Nlc3Mpe1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm91dHB1dDtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICAgLyoqXG4gICAgICogRW5jcnlwdHMgYSB0ZXh0IFxuICAgICAqXG4gICAgICogQHBhcmFtIHRleHQgLSBBIHN0cmluZyB0byBlbmNyeXB0XG4gICAgICogXG4gICAgICogQHJldHVybnMgQSBzdHJpbmcgYW4gZW5jcnlwdGVkIHRleHQgb3IgbnVsbCBpZiBhbiBlcnJvciBoYXMgb2NjdXJlZFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBlbmNyeXB0ZWQgPSB0aGlzLkFQSS5lbmNyeXB0KCdrZW4nKTtcbiAgICAgKiBpZihlbmNyeXB0KXtcbiAgICAgKiAgY29uc29sZS5sb2coZW5jcnlwdCk7XG4gICAgICogfWVsc2V7XG4gICAgICogIGNvbnNvbGUubG9nKCdFUlJPUicpO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICoqL1xuICAgYXN5bmMgZW5jcnlwdCh0ZXh0OnN0cmluZyl7XG4gICAgY29uc3QgcmVzcG9uc2UgPSAgYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5wb3N0KCdlbmNyeXB0Jywge3RleHQ6IHRleHR9KSlcbiAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgIHJldHVybiByZXNwb25zZS5vdXRwdXQ7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgIC8qKlxuICAgICAqIERlY3J5cHQgYW4gZW5jcnlwdGVkIHRleHQgaW4gdGhlIHNlcnZlciB0byBnZXQgcGxhaW4gdGV4dFxuICAgICAqXG4gICAgICogQHBhcmFtIGVuY3J5cHRlZCAtIEEgc3RyaW5nIHRvIGVuY3J5cHRcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBBIHN0cmluZyB0aGUgcGxhaW4gdGV4dCBvZiBhbiBlbmNyeXB0ZWQgdGV4dCBvciBudWxsIGlmIGFuIGVycm9yIGhhcyBvY2N1cmVkXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IHBsYWluVGV4dCA9IHRoaXMuQVBJLmRlY3J5cHQoJ0FzaTEyaVVTSURVQUlTRFUxMicpO1xuICAgICAqIGlmKHBsYWluVGV4dCl7XG4gICAgICogIGNvbnNvbGUubG9nKHBsYWluVGV4dCk7XG4gICAgICogfWVsc2V7XG4gICAgICogIGNvbnNvbGUubG9nKCdFUlJPUicpO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICoqL1xuICAgYXN5bmMgZGVjcnlwdChlbmNyeXB0ZWQ6c3RyaW5nKXtcbiAgICBjb25zdCByZXNwb25zZSA9ICBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLnBvc3QoJ2RlY3J5cHQnLCB7ZW5jcnlwdGVkOiBlbmNyeXB0ZWR9KSlcbiAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgIHJldHVybiByZXNwb25zZS5vdXRwdXQ7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBhIHZhbHVlIG1hdGNoZXMgYSBoYXNoXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGV4dCAtIEEgc3RyaW5nIHRvIGNoZWNrXG4gICAgICogXG4gICAgICogQHBhcmFtIGhhc2ggLSBBIGhhc2ggc3RyaW5nIHRvIGNoZWNrXG4gICAgICogXG4gICAgICogQHJldHVybnMgLSBUcnVlIGlmIHRleHQgYW5kIGhhc2ggbWF0Y2hlcywgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IG1hdGNoID0gdGhpcy5BUEkudmVyaWZ5SGFzaCgndGV4dCcsJyQyYWFzZGtrMi4xMjNpMTIzaWphc3VkZmtsYWpzZGxhJyk7XG4gICAgICogaWYobWF0Y2ggPT0gbnVsbCl7XG4gICAgICogIGNvbnNvbGUubG9nKCdFUlJPUicpO1xuICAgICAgKiByZXR1cm47XG4gICAgICogfVxuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKG1hdGNoKTtcbiAgICAgKiBcbiAgICoqL1xuICAgYXN5bmMgdmVyaWZ5SGFzaCh0ZXh0OnN0cmluZyxoYXNoOnN0cmluZyl7XG4gICAgY29uc3QgcmVzcG9uc2UgPSAgYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5wb3N0KCd2ZXJpZnlfaGFzaCcsIHt0ZXh0OiB0ZXh0LCBoYXNoOmhhc2h9KSlcbiAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgIHJldHVybiByZXNwb25zZS5vdXRwdXQ7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHVuaXF1ZSBpZGVudGlmaWVyIHdpdGggdGhlIGxlbmd0aCBvZiAzMlxuICAgICAqXG4gICAgICogQHJldHVybnMgQSByYW5kb20gdW5pcXVlIDMyIHN0cmluZyBpZGVudGlmaWVyXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGlkID0gdGhpcy5BUEkuY3JlYXRlVW5pcXVlSUQzMigpO1xuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIGNyZWF0ZVVuaXF1ZUlEMzIoKSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIGNvbnN0IHRpbWVzdGFtcCA9IERhdGUubm93KCkudG9TdHJpbmcoMTYpOyAvLyBHZXQgY3VycmVudCB0aW1lIGluIGhleFxuICAgICAgY29uc3QgcmFuZG9tUGFydCA9ICd4eHh4eHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC94L2csICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAxNiB8IDApLnRvU3RyaW5nKDE2KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRpbWVzdGFtcCArIHJhbmRvbVBhcnQuc2xpY2UoMCwgMTYpOyAvLyBDb21iaW5lIHRpbWVzdGFtcCB3aXRoIHJhbmRvbSBwYXJ0XG4gIH1cblxuICBwcml2YXRlIHBvc3QobWV0aG9kOiBzdHJpbmcsIGJvZHk6IHt9KSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIGZvciAodmFyIFtrZXksIG9ial0gb2YgT2JqZWN0LmVudHJpZXM8YW55Pihib2R5KSkge1xuICAgICAgaWYgKGtleSA9PSAndmFsdWVzJykge1xuICAgICAgICBmb3IgKHZhciBbZmllbGQsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgICAgICAgb2JqW2ZpZWxkXSA9IHZhbHVlID8/ICcnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoe1xuICAgICAgJ1gtUmVxdWVzdGVkLVdpdGgnOiAnWE1MSHR0cFJlcXVlc3QnLFxuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICB9KTtcbiAgICBjb25zdCBzYWx0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0PGFueT4oXG4gICAgICB0aGlzLmNvbmZpZz8uYXBpICsgJz8nICsgc2FsdCxcbiAgICAgIEpTT04uc3RyaW5naWZ5KFxuICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIEFQSV9LRVk6IHRoaXMuY29uZmlnPy5hcGlLZXksXG4gICAgICAgICAgICBBcHA6IHRoaXMuY29uZmlnPy5hcHAsXG4gICAgICAgICAgICBNZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGJvZHlcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIHsgaGVhZGVycyB9XG4gICAgKTtcbiAgfVxuXG4gIFxuICAvLyBDUkVBVEUgUkVBRCBVUERBVEUgQU5EIERFTEVURSBIQU5ETEVSU1xuXG4gIC8qKlxuICAgICAqIFJ1bnMgYW4gaW5zZXJ0IHF1ZXJ5IHRvIHRoZSBzZXJ2ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcG9zdE9iamVjdCAtIEFuIG9iamVjdCBjb250YWluaW5nIHRhYmxlcywgYW5kIHZhbHVlcyBmb3IgdGhlIFNRTCBxdWVyeS5cbiAgICAgKiBAcmV0dXJucyBBIHJlc3Bvc2Ugb2JqZWN0IFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBkZXRhaWxzLnBhc3N3b3JkID0gdGhpcy5BUEkuaGFzaChkZXRhaWxzLnBhc3N3b3JkKTtcbiAgICAgKiBcbiAgICAgKiBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5BUEkuY3JlYXRlKHtcbiAgICAgKiAgIHRhYmxlczogJ2FkbWluJyxcbiAgICAgKiAgIHZhbHVlczoge1xuICAgICAqICAgICdlbWFpbCc6dGhpcy5BUEkuY29yZUZvcm1bJ2VtYWlsJ10sXG4gICAgICogICAgJ3Bhc3N3b3JkJzogdGhpcy5BUEkuY29yZUZvcm1bJ3Bhc3N3b3JkJ10sIFxuICAgICAqICB9LFxuICAgICAqIH0pO1xuICAgICAqIFxuICAgICAqIGlmKGRhdGEuc3VjY2Vzcyl7XG4gICAgICogIGNvbnNvbGUubG9nKGRhdGEub3V0cHV0KTtcbiAgICAgKiB9XG4gICAgICogXG4gICAqKi9cbiAgYXN5bmMgY3JlYXRlKHBvc3RPYmplY3Q6Q29yZUNyZWF0ZU9iamVjdCk6UHJvbWlzZTxDb3JlUmVzcG9uc2U+e1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICByZXR1cm4gIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMucG9zdCgnY3JlYXRlX2VudHJ5Jywge1xuICAgICAgJ2RhdGEnOiBKU09OLnN0cmluZ2lmeShwb3N0T2JqZWN0KSxcbiAgICB9KSk7XG4gIH1cblxuICAvKipcbiAgICAgKiBSdW5zIGFuIHJlYWQgcXVlcnkgdG8gdGhlIHNlcnZlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwb3N0T2JqZWN0IC0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgc2VsZWN0b3JzLCB0YWJsZXMsIGFuZCBjb25kaXRpb25zIGZvciB0aGUgU1FMIHF1ZXJ5LlxuICAgICAqIEByZXR1cm5zIEEgcmVzcG9zZSBvYmplY3QgXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLkFQSS5yZWFkKHtcbiAgICAgKiAgIHNlbGVjdG9yczogW1xuICAgICAqICAgICAnZl9hZG1pbi5JRCcsXG4gICAgICogICAgICdVc2VybmFtZScsXG4gICAgICogICAgICdFbWFpbCcsXG4gICAgICogICAgICdDT1VOVChmX21lc3NhZ2VzLklEKSBhcyBpbmJveCdcbiAgICAgKiAgIF0sXG4gICAgICogICB0YWJsZXM6ICdmX2FkbWluJyxcbiAgICAgKiAgIGNvbmRpdGlvbnM6IGBXSEVSRSBlbWFpbCA9ICR7dGhpcy5BUEkuY29yZUZvcm1bJ2VtYWlsJ119YFxuICAgICAqIH0pO1xuICAgICAqIFxuICAgICAqIGlmKGRhdGEuc3VjY2VzcyAmJiBkYXRhLm91dHB1dC5sZW5ndGggPiAwKXtcbiAgICAgKiAvLyBzaW5nbGUgb3V0cHV0XG4gICAgICogIGNvbnNvbGUubG9nKGRhdGEub3V0cHV0WzBdKTtcbiAgICAgKiAvLyBhbGwgb3V0dHB1dFxuICAgICAqICBmb3IobGV0IHJvdyBvZiBkYXRhLm91dHB1dCl7XG4gICAgICogICAgY29uc29sZS5sb2cocm93KTtcbiAgICAgKiAgfVxuICAgICAqIH1cbiAgICAgKiBcbiAgICoqL1xuICBhc3luYyByZWFkKHBvc3RPYmplY3Q6Q29yZVJlYWRPYmplY3QpOlByb21pc2U8Q29yZVJlc3BvbnNlPntcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMucG9zdCgnZ2V0X2VudHJpZXMnLCB7XG4gICAgICAnZGF0YSc6IEpTT04uc3RyaW5naWZ5KHBvc3RPYmplY3QpLFxuICAgIH0pKTtcbiAgfVxuICAgLyoqXG4gICAgICogUnVucyBhbiB1cGRhdGUgcXVlcnkgdG8gdGhlIHNlcnZlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwb3N0T2JqZWN0IC0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgc2VsZWN0b3JzLCB2YWx1ZXMgLHRhYmxlcywgYW5kIGNvbmRpdGlvbnMgZm9yIHRoZSBTUUwgcXVlcnkuXG4gICAgICogQHJldHVybnMgQSByZXNwb3NlIG9iamVjdCBcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZW5jcnlwdGVkID0gdGhpcy5BUEkuaGFzaCh0aGlzLkFQSS5jb3JlRm9ybVsncGFzc3dvcmQnXSk7XG4gICAgICogXG4gICAgICogY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuQVBJLnVwZGF0ZSh7XG4gICAgICogICB0YWJsZXM6ICdmX2FkbWluJyxcbiAgICAgKiAgIHZhbHVlczoge1xuICAgICAqICAgICdlbWFpbCc6dGhpcy5BUEkuY29yZUZvcm1bJ2VtYWlsJ10sXG4gICAgICogICAgJ3Bhc3N3b3JkJzogZW5jcnlwdGVkLCBcbiAgICAgKiAgIH0sXG4gICAgICogICBjb25kaXRpb25zOiBgV0hFUkUgZW1haWwgPSAke3RoaXMuQVBJLmNvcmVGb3JtWydlbWFpbCddfWBcbiAgICAgKiB9KTtcbiAgICAgKiBcbiAgICAgKiBpZihkYXRhLnN1Y2Nlc3Mpe1xuICAgICAqICAgY29uc29sZS5sb2coZGF0YS5vdXRwdXQpO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICoqL1xuICBhc3luYyB1cGRhdGUocG9zdE9iamVjdDpDb3JlVXBkYXRlT2JqZWN0KTpQcm9taXNlPENvcmVSZXNwb25zZT57XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgcmV0dXJuIGZpcnN0VmFsdWVGcm9tKCB0aGlzLnBvc3QoJ3VwZGF0ZV9lbnRyeScsIHtcbiAgICAnZGF0YSc6IEpTT04uc3RyaW5naWZ5KHBvc3RPYmplY3QpLFxuICB9KSk7XG4gIH1cblxuICAvKipcbiAgICAgKiBSdW5zIGFuIGRlbGV0ZSBxdWVyeSB0byB0aGUgc2VydmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHBvc3RPYmplY3QgLSBBbiBvYmplY3QgY29udGFpbmluZyB0YWJsZXMsIGFuZCBjb25kaXRpb25zIGZvciB0aGUgU1FMIHF1ZXJ5LlxuICAgICAqIEByZXR1cm5zIEEgcmVzcG9zZSBvYmplY3QgXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLkFQSS5kZWxldGUoe1xuICAgICAqICAgdGFibGVzOiAnZl9hZG1pbicsXG4gICAgICogICBjb25kaXRpb25zOiBgV0hFUkUgZW1haWwgPSAke3RoaXMuQVBJLmNvcmVGb3JtWydlbWFpbCddfWBcbiAgICAgKiB9KTtcbiAgICAgKiBcbiAgICAgKiBpZihkYXRhLnN1Y2Nlc3Mpe1xuICAgICAqICAgY29uc29sZS5sb2coZGF0YS5vdXRwdXQpO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICoqL1xuICBhc3luYyBkZWxldGUocG9zdE9iamVjdDpDb3JlRGVsZXRlT2JqZWN0KTpQcm9taXNlPENvcmVSZXNwb25zZT57XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLnBvc3QoJ2RlbGV0ZV9lbnRyeScsIHtcbiAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHBvc3RPYmplY3QpLFxuICAgIH0pKVxuICB9XG5cbiAgLy8gRklMRSBIQU5ETEVSU1xuXG4gICAvKipcbiAgICAgKiBHZXQgY29tcGxldGUgZmlsZSBVUkwgZnJvbSB0aGUgc2VydmVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZmlsZSAtIEEgc3RyaW5nIHRoYXQgcG9pbnRzIHRvIHRoZSBmaWxlLlxuICAgICAqIEByZXR1cm5zIEEgY29tcGxldGUgdXJsIHN0cmluZyBmcm9tIHRoZSBzZXJ2ZXIgXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IHVybCA9IHRoaXMuQVBJLmdldEZpbGVVUkwoJ2ZpbGVzL3Byb2ZpbGUucG5nJyk7XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqICBodHRwczovL2xvY2FsaG9zdDo4MDgwL2ZpbGVzL3Byb2ZpbGUucG5nXG4gICAgICogXG4gICAqKi9cbiAgZ2V0RmlsZVVSTChmaWxlOiBzdHJpbmcpOnN0cmluZ3x1bmRlZmluZWQge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydChcIlBsZWFzZSBpbml0aWFsaXplIHVzd2Fnb24gY29yZSBvbiByb290IGFwcC5jb21wb25lbnQudHNcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChmaWxlKSB7XG4gICAgICBpZiAoZmlsZS5pbmNsdWRlcygnaHR0cCcpKSByZXR1cm4gZmlsZTtcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZz8uc2VydmVyICsgYC8ke3RoaXMuY29uZmlnLmFwcH0vYCArIGZpbGUgO1xuICAgIH1cbiAgICByZXR1cm4gZmlsZTtcbiAgfVxuXG4gICAvKipcbiAgICAgKiBVcGxvYWRzIGEgZmlsZSB0byB0aGUgc2VydmVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZmlsZSAtIEEgRmlsZSB0byB1cGxvYWRcbiAgICAgKiBAcGFyYW0gZmlsZW5hbWUgLSBBIHN0cmluZyB0aGF0IHBvaW50cyB0byB3aGVyZSB0aGUgZmlsZSB0byBiZSBzdG9yZWQgaW4gdGhlIHNlcnZlclxuICAgICAqIEBwYXJhbSBjaHVua1NpemUgLSBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIG51bWJlciBvZiBieXRlcyB0byB1cGxvYWQgcGVyIGNodW5rXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFxuICAgICAqIGdldFVwbG9hZFByb2dyZXNzKCl7XG4gICAgICogIHJldHVybiB0aGlzLkFQSS51cGxvYWRQcm9ncmVzc1xuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBhd2FpdCB0aGlzLkFQSS51cGxvYWRGaWxlKHNvbWVmaWxlLCAnL2ZpbGVzL3Byb2ZpbGUucG5nJyk7XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqIDxkaXY+e3tnZXRVcGxvYWRQcm9ncmVzcygpfX08ZGl2PiAvLyBkeW5hbWljYWxseSB1cGRhdGVzIHRoZSBwcm9ncmVzc1xuICAgKiovXG4gIHVwbG9hZEZpbGUoZmlsZTogRmlsZSwgZmlsZW5hbWU6IHN0cmluZywgY2h1bmtTaXplOiBudW1iZXIgPSAxMDI0ICogMTAyNCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydChcIlBsZWFzZSBpbml0aWFsaXplIHVzd2Fnb24gY29yZSBvbiByb290IGFwcC5jb21wb25lbnQudHNcIik7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKCk9PntyZXR1cm4gbnVsbH0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdG90YWxDaHVua3MgPSBNYXRoLmNlaWwoZmlsZS5zaXplIC8gY2h1bmtTaXplKTtcbiAgICAgIGxldCB1cGxvYWRlZENodW5rcyA9IDA7IC8vIFRyYWNrIHVwbG9hZGVkIGNodW5rc1xuXG4gICAgICBjb25zdCB1cGxvYWRDaHVuayA9IChjaHVua0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBjaHVua0luZGV4ICogY2h1bmtTaXplO1xuICAgICAgICBjb25zdCBlbmQgPSBNYXRoLm1pbihzdGFydCArIGNodW5rU2l6ZSwgZmlsZS5zaXplKTtcbiAgICAgICAgY29uc3QgY2h1bmsgPSBmaWxlLnNsaWNlKHN0YXJ0LCBlbmQpO1xuXG4gICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIHJlYWRlci5vbmxvYWRlbmQgPSAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgYmFzZTY0U3RyaW5nID0gKHJlYWRlci5yZXN1bHQgYXMgc3RyaW5nKS5zcGxpdCgnLCcpWzFdO1xuXG4gICAgICAgICAgdGhpcy5odHRwXG4gICAgICAgICAgICAucG9zdCh0aGlzLmNvbmZpZz8ubm9kZXNlcnZlciArICcvZmlsZWhhbmRsZXItcHJvZ3Jlc3MnLCB7XG4gICAgICAgICAgICAgIGtleTogdGhpcy5jb25maWc/LmFwaUtleSxcbiAgICAgICAgICAgICAgYXBwOiB0aGlzLmNvbmZpZz8uYXBwLFxuICAgICAgICAgICAgICBtZXRob2Q6ICdjcmVhdGVfdXJsJyxcbiAgICAgICAgICAgICAgY2h1bms6IGJhc2U2NFN0cmluZyxcbiAgICAgICAgICAgICAgZmlsZU5hbWU6IGAke3RoaXMuY29uZmlnPy5hcHB9L2AgKyBmaWxlbmFtZSxcbiAgICAgICAgICAgICAgY2h1bmtJbmRleDogY2h1bmtJbmRleCxcbiAgICAgICAgICAgICAgdG90YWxDaHVua3M6IHRvdGFsQ2h1bmtzLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoe1xuICAgICAgICAgICAgICBuZXh0OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdXBsb2FkZWRDaHVua3MrKztcbiAgICAgICAgICAgICAgICB0aGlzLnVwbG9hZFByb2dyZXNzID0gTWF0aC5yb3VuZCgodXBsb2FkZWRDaHVua3MgLyB0b3RhbENodW5rcykgKiAxMDApO1xuICAgICAgICAgICAgICAgIGlmIChjaHVua0luZGV4ICsgMSA8IHRvdGFsQ2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgICAvLyBVcGxvYWQgbmV4dCBjaHVua1xuICAgICAgICAgICAgICAgICAgdXBsb2FkQ2h1bmsoY2h1bmtJbmRleCArIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgRmlsZSB1cGxvYWQgY29tcGxldGU6ICR7ZmlsZW5hbWV9YCk7XG4gICAgICAgICAgICAgICAgICB0aGlzLnVwbG9hZFByb2dyZXNzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpOyAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIHdoZW4gdGhlIHVwbG9hZCBpcyBjb21wbGV0ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZXJyb3I6IChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmVycm9yKCdFcnJvciB1cGxvYWRpbmcgY2h1bmsnLCBlcnIpO1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpOyAvLyBSZWplY3QgdGhlIHByb21pc2Ugb24gZXJyb3JcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGNodW5rKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFN0YXJ0IHVwbG9hZGluZyB0aGUgZmlyc3QgY2h1bmtcbiAgICAgIHVwbG9hZENodW5rKDApO1xuICAgIH0pO1xuICB9XG59XG4iXX0=