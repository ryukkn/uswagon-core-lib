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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1jb3JlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWNvcmUvc3JjL2xpYi91c3dhZ29uLWNvcmUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBYSxNQUFNLGVBQWUsQ0FBQztBQUd0RCxPQUFPLEVBQVUsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBSzlDLE1BQU0sT0FBTyxrQkFBa0I7SUFrQzdCLFlBQ1UsSUFBZ0IsRUFDaEIsTUFBYztRQURkLFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQXRCaEIsZUFBVSxHQUFZLEVBQUUsQ0FBQTtRQUMvQjs7Ozs7Ozs7Ozs7V0FXRztRQUNHLGFBQVEsR0FBWSxFQUFFLENBQUE7UUFJckIsZUFBVSxHQUFxRCxFQUFFLENBQUM7SUFNdEUsQ0FBQztJQUVMLGlCQUFpQjtJQUNqQjs7Ozs7Ozs7Ozs7OztRQWFJO0lBQ0osVUFBVSxDQUFDLE1BQWlCO1FBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLGFBQWEsQ0FBQztRQUN2QyxJQUFJLENBQUMsTUFBTyxDQUFDLFNBQVMsR0FBRyxDQUFDLE9BQU8sRUFBQyxFQUFFO1lBQ2xDLElBQUksY0FBYyxHQUFHLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENB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QVcsRUFBRSxDQUFDO2dDQUNuQixPQUFPLEVBQUUsQ0FBQyxDQUFDLGtEQUFrRDs0QkFDL0QsQ0FBQzt3QkFDSCxDQUFDO3dCQUNELEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFOzRCQUNiLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs0QkFDbkIsK0NBQStDOzRCQUMvQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyw4QkFBOEI7d0JBQzdDLENBQUM7cUJBQ0YsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQztnQkFFRixNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlCLENBQUMsQ0FBQztZQUVGLGtDQUFrQztZQUNsQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFnQjtRQUM5QixNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSTthQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLEdBQUcsdUJBQXVCLEVBQUU7WUFDdkQsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTTtZQUN4QixHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHO1lBQ3JCLE1BQU0sRUFBRSxZQUFZO1lBQ3BCLFFBQVEsRUFBRyxRQUFRO1NBQ3BCLENBQUMsQ0FBQyxDQUNGO0lBQ0wsQ0FBQztJQUFBLENBQUM7K0dBeG5CUyxrQkFBa0I7bUhBQWxCLGtCQUFrQixjQUZqQixNQUFNOzs0RkFFUCxrQkFBa0I7a0JBSDlCLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cENsaWVudCwgSHR0cEhlYWRlcnMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBJbmplY3RhYmxlLCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBDb3JlQ29uZmlnLCBDb3JlQ3JlYXRlT2JqZWN0LCBDb3JlRGVsZXRlT2JqZWN0LCBDb3JlRm9ybSwgQ29yZVJlYWRPYmplY3QsIENvcmVSZXNwb25zZSwgQ29yZVVwZGF0ZU9iamVjdCwgU25hY2tiYXJDb3JlRmVlZGJhY2sgfSBmcm9tICcuL3R5cGVzL3Vzd2Fnb24tY29yZS50eXBlcyc7XG5pbXBvcnQgeyAgZmlyc3QsIGZpcnN0VmFsdWVGcm9tIH0gZnJvbSAncnhqcyc7XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIFVzd2Fnb25Db3JlU2VydmljZSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gICAvKipcbiAgICAgKiBVcGxvYWQgcHJvZ3Jlc3MgaW5kaWNhdG9yIG9uIGN1cnJlbnQgZmlsZSB1cGxvYWRcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGdldFVwbG9hZFByb2dyZXNzKCl7XG4gICAgICogIHJldHVybiB0aGlzLkFQSS51cGxvYWRQcm9ncmVzcztcbiAgICAgKiB9XG4gICAgICogIFxuICAgKiovXG4gIHB1YmxpYyB1cGxvYWRQcm9ncmVzcz86bnVtYmVyO1xuXG4gIHByaXZhdGUgY29yZUZlZWRiYWNrPzpTbmFja2JhckNvcmVGZWVkYmFjaztcblxuICBwcml2YXRlIHB1YmxpY0Zvcm06Q29yZUZvcm0gPSB7fVxuICAgLyoqXG4gICAgICogU2VjdXJlIGZvcm0gZm9yIHN0b3JpbmcgbW9yZSBzZWN1cmUgaW5wdXRcbiAgICAgKiBcbiAgICAgKiBOT1RFOiBUaGlzIGlzIHRoZSBmb3JtIHRoYXQgc2hvdWxkIGJlIHVzZWQgd2hlbiBidWlsZGluZyBwb3N0T2JqZWN0c1xuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogZm9yKGxldCBrZXkgaW4gdGhpcy5BUEkuY29yZUZvcm0pe1xuICAgICAqICAvLyBwcm9jZXNzIHZhbHVlXG4gICAgICogIGNvbnNvbGUubG9nKHRoaXMuQVBJLmNvcmVGb3JtW2tleV0pO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICoqL1xuICBwdWJsaWMgY29yZUZvcm06Q29yZUZvcm0gPSB7fVxuICBcbiAgcHJpdmF0ZSBzb2NrZXQ/OiBXZWJTb2NrZXQ7XG4gIHByaXZhdGUgY29uZmlnPzogQ29yZUNvbmZpZztcbiAgcHJpdmF0ZSBsaXZlRXZlbnRzOntba2V5OiBzdHJpbmddOiAobWVzc2FnZTogTWVzc2FnZUV2ZW50KSA9PiB2b2lkIH0gPSB7fTtcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuICApIHsgfVxuXG4gIC8vIElOSVRJQUxJWkFUSU9OXG4gIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBzZXJ2aWNlIGZvciB0aGUgcHJvamVjdFxuICAgICAqIEBwYXJhbSBjb25maWcgLSBjb25maWd1cmF0aW9uIHRoYXQgcG9pbnRzIHRoZSBzZXJ2aWNlIHRvIGl0cyBhcHByb3ByaWF0ZSBzZXJ2ZXJcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLmluaXRpYWxpemUoe1xuICAgICAqICBhcGk6ZW52aXJvbm1lbnQuYXBpLFxuICAgICAqICBhcGlLZXk6IGVudmlyb25tZW50LmFwaUtleSxcbiAgICAgKiAgbm9kZXNlcnZlcjogZW52aXJvbm1lbnQubm9kZXNlcnZlcixcbiAgICAgKiAgc2VydmVyOiBlbnZpcm9ubWVudC5zZXJ2ZXIsXG4gICAgICogIHNvY2tldDogZW52aXJvbm1lbnQuc29ja2V0XG4gICAgICogfSlcbiAgICAgKiBcbiAgICoqL1xuICBpbml0aWFsaXplKGNvbmZpZzpDb3JlQ29uZmlnKXtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoY29uZmlnLnNvY2tldCk7XG4gICAgdGhpcy5zb2NrZXQuYmluYXJ5VHlwZSA9ICdhcnJheWJ1ZmZlcic7XG4gICAgdGhpcy5zb2NrZXQhLm9ubWVzc2FnZSA9IChtZXNzYWdlKT0+e1xuICAgICAgdmFyIGRlY29kZWRNZXNzYWdlID0gbmV3IFRleHREZWNvZGVyKCd1dGYtOCcpLmRlY29kZShtZXNzYWdlLmRhdGEpO1xuICAgICAgY29uc3Qgc29ja2V0RGF0YSA9IEpTT04ucGFyc2UoZGVjb2RlZE1lc3NhZ2UpO1xuICAgICAgaWYoc29ja2V0RGF0YS5hcHAgIT0gY29uZmlnLmFwcCkgcmV0dXJuO1xuICAgICAgZm9yIChjb25zdCBpZCBpbiB0aGlzLmxpdmVFdmVudHMpIHtcbiAgICAgICAgICB0aGlzLmxpdmVFdmVudHNbaWRdKHNvY2tldERhdGEuZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgIC8qKlxuICAgICAqIEFkZCBhIG5ldyBsaXZlIGxpc3RlbmVyIGZyb20gdGhlIHNlcnZlcidzIHdlYnNvY2tldFxuICAgICAqIFxuICAgICAqIEBwYXJhbSBpZCAtIFVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGUgbGlzdGVuZXJzIHRvIGF2b2lkIGNvbGxpc2lvbnNcbiAgICAgKiBAcGFyYW0gaGFuZGxlciAtIFdlYnNvY2tldCBtZXNzYWdlcyBhcmUgcGFzc2VkIHRvIHRoaXMgaGFuZGxlclxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0aGlzLkFQSS5hZGRMaXZlTGlzdGVuZXIoJ2V2ZW50LTEnLChtZXNzYWdlOntba2V5OnN0cmluZ106YW55fSk9PntcbiAgICAgKiAgT1VUUFVUOlxuICAgICAqICAvLyBzYW1lIGFzIHRoZSBqc29uIHNlbnQgZnJvbSBzb2NrZXRTZW5kKGRhdGEpXG4gICAgICogIC8vIGxvZ2ljcyBhcmUgYXBwbGllZCBoZXJlIHNvIHRoYXQgbWVzc2FnZXMgYXJlIG9ubHkgcmVjZWl2ZWQgb24gc3BlY2lmaWMgY2xpZW50c1xuICAgICAqICBjb25zb2xlLmxvZyhtZXNzYWdlKTtcbiAgICAgKiB9KVxuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIGFkZFNvY2tldExpc3RlbmVyKCBpZDpzdHJpbmcsaGFuZGxlcjoobWVzc2FnZToge1trZXk6c3RyaW5nXTphbnl9KT0+dm9pZCkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICB0aGlzLmxpdmVFdmVudHNbaWRdPSBoYW5kbGVyO1xuICB9XG4gIC8qKlxuICAgICAqIEdldCBsaXN0IG9mIGxpdmUgbGlzdGVuZXJzIGluIHRoZSBwcm9qZWN0XG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLmdldExpc3RlbmVycygpO1xuICAgICAqIFxuICAgICAqIE9VVFBVVDogQW4gYWxlcnQgc2hvd2luZyBsaXN0IG9mIGxpc3RlbmVyc1xuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIGdldExpc3RlbmVycygpIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgYWxlcnQoSlNPTi5zdHJpbmdpZnkoT2JqZWN0LmtleXModGhpcy5saXZlRXZlbnRzKSkpO1xuICB9XG4gIC8qKlxuICAgICAqIFNlbmRzIGEgbWVzc2FnZSB0byB0aGUgd2Vic29ja2V0XG4gICAgICogQHBhcmFtIGRhdGEgLSBBIGpzb24gb2JqZWN0IG1lc3NhZ2VcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdGhpcy5BUEkuc29ja2V0U2VuZCh7XG4gICAgICogICAgdG86IHN0dWRlbnQuaWQsXG4gICAgICogICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgKiB9KVxuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIHNvY2tldFNlbmQoZGF0YTogb2JqZWN0KSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIHRoaXMuc29ja2V0IS5vbm9wZW4gPSAoKT0+e1xuICAgICAgdGhpcy5zb2NrZXQhLnNlbmQoXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHsga2V5OiB0aGlzLmNvbmZpZz8uYXBpS2V5LCBhcHA6IHRoaXMuY29uZmlnPy5hcHAsIGRhdGE6IGRhdGEgfSlcbiAgICAgICk7XG4gICAgfVxuICB9XG4gIFxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLnNvY2tldD8uY2xvc2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgcGdFc2NhcGVTdHJpbmcoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW5wdXQgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgIH0gXG4gICAgLy8gRXNjYXBlIHNpbmdsZSBxdW90ZXMgYnkgcmVwbGFjaW5nIHRoZW0gd2l0aCB0d28gc2luZ2xlIHF1b3Rlc1xuICAgIHJldHVybiBpbnB1dC5yZXBsYWNlKC8nL2csIFwiJydcIikudHJpbSgpO1xuICB9XG5cbiAgLyoqXG4gICAgICogQnVpbGRzIGEgQ29yZUZvcm0gZnJvbSB1c2VyIGlucHV0XG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5IC0gQSBzdHJpbmcgcmVmZXJlbmNlIHRvIGZvcm0ga2V5XG4gICAgICogQHBhcmFtIHZhbHVlIC0gQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiBhIGZvcm0ga2V5XG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBcbiAgICAgKiBoYW5kbGVJbnB1dChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyl7XG4gICAgICogIHRoaXMuQVBJLmhhbmRsZUZvcm1WYWx1ZSgnZW1haWwnLCBldmVudC50YXJnZXQudmFsdWUpOyAvLyBrZXkgc2hvdWxkIGJlIGluaXRpYWxpemVkIHVzaW5nIGluaXRpYWxpemVGb3JtKClcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqIDxpbnB1dCAoY2hhbmdlKT0naGFuZGxlSW5wdXQoXCJlbWFpbFwiLCAkZXZlbnQpJyA+IFxuICAgICAqXG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgaGFuZGxlRm9ybVZhbHVlKGtleTpzdHJpbmcsIHZhbHVlOnN0cmluZyl7XG4gICAgdGhpcy5wdWJsaWNGb3JtW2tleV0gPSB2YWx1ZTsgXG4gICAgdGhpcy5jb3JlRm9ybVtrZXldID0gdGhpcy5wZ0VzY2FwZVN0cmluZyh2YWx1ZSk7XG4gIH1cbiAgIC8qKlxuICAgICAqIEJ1aWxkcyBhIENvcmVGb3JtIGZyb20gdXNlciBpbnB1dFxuICAgICAqXG4gICAgICogQHBhcmFtIGtleSAtIEEgc3RyaW5nIHJlZmVyZW5jZSB0byBmb3JtIGtleVxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogXG4gICAgICogZ2V0SW5wdXQoa2V5OnN0cmluZyl7XG4gICAgICogIHJldHVybiB0aGlzLkFQSS5nZXRGb3JtVmFsdWUoa2V5KTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqIDxkaXY+e3tnZXRJbnB1dCgnZW1haWwnKX19PC9kaXY+XG4gICAgICogXG4gICAqKi9cbiAgIGdldEZvcm1WYWx1ZShrZXk6c3RyaW5nKXtcbiAgICBpZih0aGlzLnB1YmxpY0Zvcm1ba2V5XSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdQbGVhc2UgaW5pdGlhbGl6ZSB0aGUgZm9ybSB1c2luZyBpbml0aWFsaXplRm9ybShbLi4uZmllbGRzXSknKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHVibGljRm9ybVtrZXldO1xuICB9XG5cbiAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBhIENvcmVGb3JtXG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5cyAtIEEgbGlzdCBvZiBzdHJpbmdzIHJlcHJlc2VudGluZyBmb3JtIGtleXNcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLmluaXRpYWxpemVGb3JtKFsnZW1haWwnXSk7XG4gICAgICogIFxuICAgICAqIE9VVFBVVDpcbiAgICAgKiBjb25zb2xlLmxvZyh0aGlzLkFQSS5jb3JlRm9ybSk7IFxuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIGluaXRpYWxpemVGb3JtKGtleXM6c3RyaW5nW10pe1xuICAgIHRoaXMucHVibGljRm9ybSA9IGtleXMucmVkdWNlKChwcmV2OmFueSxjdXJyOmFueSk9PntcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHByZXYsIHtbY3Vycl06Jyd9KVxuICAgIH0se30pXG4gICAgdGhpcy5jb3JlRm9ybSA9IGtleXMucmVkdWNlKChwcmV2OmFueSxjdXJyOmFueSk9PntcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHByZXYsIHtbY3Vycl06Jyd9KVxuICAgIH0se30pXG4gIH1cblxuICAvLyBVVElMSVRJRVNcbiAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGhhc2ggZnJvbSB0aGUgc2VydmVyIGZvciBlbmNyeXB0aW5nIGRhdGFcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbmNyeXB0IC0gQSBzdHJpbmcgdG8gZW5jcnlwdFxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogXG4gICAgICogdGhpcy5BUEkuc2VuZEZlZWRiYWNrKCdzdWNjZXNzJywgJ1B1c2hlZCBkYXRhIScpXG4gICAgICogXG4gICAqKi9cbiAgICBzZW5kRmVlZGJhY2sodHlwZTonc3VjY2Vzcyd8J2Vycm9yJ3wnbmV1dHJhbCd8J3dhcm5pbmcnLG1lc3NhZ2U6c3RyaW5nLCB0aW1lcj86bnVtYmVyKXtcbiAgICAgIHRoaXMuY29yZUZlZWRiYWNrID0ge1xuICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAodGltZXIgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIFNldCBhIHRpbWVyIHRvIHJlc2V0IHRoZSBzbmFja2JhciBmZWVkYmFjayBhZnRlciAyIHNlY29uZHNcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5jb3JlRmVlZGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgICAgIH0sIHRpbWVyKTtcbiAgICAgIH1cbiAgICB9XG4gIC8qKlxuICAgICAqIFN0b3JlIEFQSSBmZWVkYmFjayBmb3Igc25hY2tiYXJzIGFuZCBvdGhlciBkaXNwbGF5IGZlZWRiYWNrXG4gICAgICogXG4gICAgICogQHJldHVybnMgLSBBIGZlZWRiYWNrIG9iamVjdCB3aXRoIHt0eXBlLCBtZXNzYWdlfVxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogXG4gICAgICogZ2V0RmVlZGJhY2soKXtcbiAgICAgKiAgIHJldHVybiB0aGlzLkFQSS5nZXRGZWVkYmFjaygpO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBPVVRQVVQ6XG4gICAgICogIC8vIFNuYWNrYmFycyBpbiBhcHAuY29tcG9uZW50LnRzIChyb290KVxuICAgICAqICA8ZGl2IGNsYXNzPSdzbmFja2JhcicgKm5nSWY9J2dldEZlZWRiYWNrKCkudHlwZSAhPSB1bmRlZmluZWQnPiBTb21lIEZlZWRiYWNrIDwvZGl2PlxuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gICAgZ2V0RmVlZGJhY2soKXtcbiAgICAgIHJldHVybiB0aGlzLmNvcmVGZWVkYmFjaztcbiAgICB9XG4gICAvKipcbiAgICAgKiBDcmVhdGVzIGEgaGFzaCBmcm9tIHRoZSBzZXJ2ZXIgZm9yIG5vbiBkZWNyeXB0YWJsZSBkYXRhXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGV4dCAtIEEgc3RyaW5nIHRvIGVuY3J5cHRcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBBIHN0cmluZyBoYXNoIG9yIHRocm93cyBhbiBlcnJvciBpZiBhbiBlcnJvciBoYXMgb2NjdXJlZFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBoYXNoID0gdGhpcy5BUEkuaGFzaCgna2VuJyk7XG4gICAgICogXG4gICAgICogY29uc29sZS5sb2coaGFzaCk7XG4gICAgICogXG4gICAqKi9cbiAgYXN5bmMgaGFzaCh0ZXh0OnN0cmluZyl7XG4gICAgY29uc3QgcmVzcG9uc2UgPSAgYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5wb3N0KCdnZXRfaGFzaCcsIHt0ZXh0OiB0ZXh0fSkpXG4gICAgaWYocmVzcG9uc2Uuc3VjY2Vzcyl7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub3V0cHV0O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmFibGUgdG8gaGFzaDogU2VydmVyIEVycm9yJyk7XG5cbiAgICB9XG4gIH1cbiAgIC8qKlxuICAgICAqIEVuY3J5cHRzIGEgdGV4dCBcbiAgICAgKlxuICAgICAqIEBwYXJhbSB0ZXh0IC0gQSBzdHJpbmcgdG8gZW5jcnlwdFxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIEEgc3RyaW5nIGFuIGVuY3J5cHRlZCB0ZXh0IG9yIHRocm93cyBhbiBlcnJvciBpZiBhbiBlcnJvciBoYXMgb2NjdXJlZFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBlbmNyeXB0ZWQgPSB0aGlzLkFQSS5lbmNyeXB0KCdrZW4nKTtcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyhlbmNyeXB0ZWQpO1xuICAgICAqIFxuICAgKiovXG4gICBhc3luYyBlbmNyeXB0KHRleHQ6c3RyaW5nKXtcbiAgICBjb25zdCByZXNwb25zZSA9ICBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLnBvc3QoJ2VuY3J5cHQnLCB7dGV4dDogdGV4dH0pKVxuICAgIGlmKHJlc3BvbnNlLnN1Y2Nlc3Mpe1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm91dHB1dDtcbiAgICB9ZWxzZXtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGVuY3J5cHQ6IFNlcnZlciBFcnJvcicpO1xuXG4gICAgfVxuICB9XG4gICAvKipcbiAgICAgKiBEZWNyeXB0IGFuIGVuY3J5cHRlZCB0ZXh0IGluIHRoZSBzZXJ2ZXIgdG8gZ2V0IHBsYWluIHRleHRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbmNyeXB0ZWQgLSBBIHN0cmluZyB0byBlbmNyeXB0XG4gICAgICogXG4gICAgICogQHJldHVybnMgQSBzdHJpbmcgdGhlIHBsYWluIHRleHQgb2YgYW4gZW5jcnlwdGVkIHRleHQgb3Igb3IgdGhyb3dzIGFuIGVycm9yIGlmIGFuIGVycm9yIGhhcyBvY2N1cmVkXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IHBsYWluVGV4dCA9IHRoaXMuQVBJLmRlY3J5cHQoJ0FzaTEyaVVTSURVQUlTRFUxMicpO1xuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKHBsYWluVGV4dCk7XG4gICAgICogXG4gICAqKi9cbiAgIGFzeW5jIGRlY3J5cHQoZW5jcnlwdGVkOnN0cmluZyl7XG4gICAgY29uc3QgcmVzcG9uc2UgPSAgYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5wb3N0KCdkZWNyeXB0Jywge2VuY3J5cHRlZDogZW5jcnlwdGVkfSkpXG4gICAgaWYocmVzcG9uc2Uuc3VjY2Vzcyl7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub3V0cHV0O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmFibGUgdG8gZGVjcnlwdCBoYXNoOiBTZXJ2ZXIgRXJyb3InKTtcbiAgICB9XG4gIH1cbiAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBhIHZhbHVlIG1hdGNoZXMgYSBoYXNoXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGV4dCAtIEEgc3RyaW5nIHRvIGNoZWNrXG4gICAgICogXG4gICAgICogQHBhcmFtIGhhc2ggLSBBIGhhc2ggc3RyaW5nIHRvIGNoZWNrXG4gICAgICogXG4gICAgICogQHJldHVybnMgLSBUcnVlIGlmIHRleHQgYW5kIGhhc2ggbWF0Y2hlcywgZmFsc2Ugb3RoZXJ3aXNlLiBUaHJvd3MgYW4gZXJyb3IgaWYgYW4gZXJyb3IgaGFzIG9jY3VycmVkLlxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBtYXRjaCA9IHRoaXMuQVBJLnZlcmlmeUhhc2goJ3RleHQnLCckMmFhc2RrazIuMTIzaTEyM2lqYXN1ZGZrbGFqc2RsYScpO1xuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKG1hdGNoKTtcbiAgICAgKiBcbiAgICoqL1xuICAgYXN5bmMgdmVyaWZ5SGFzaCh0ZXh0OnN0cmluZyxoYXNoOnN0cmluZyl7XG4gICAgY29uc3QgcmVzcG9uc2UgPSAgYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5wb3N0KCd2ZXJpZnlfaGFzaCcsIHt0ZXh0OiB0ZXh0LCBoYXNoOmhhc2h9KSlcbiAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgIHJldHVybiByZXNwb25zZS5vdXRwdXQ7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byB2ZXJpZnkgaGFzaDogU2VydmVyIEVycm9yJyk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgICAqIENyZWF0ZXMgYSB1bmlxdWUgaWRlbnRpZmllciB3aXRoIHRoZSBsZW5ndGggb2YgMzJcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgcmFuZG9tIHVuaXF1ZSAzMiBzdHJpbmcgaWRlbnRpZmllclxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBpZCA9IHRoaXMuQVBJLmNyZWF0ZVVuaXF1ZUlEMzIoKTtcbiAgICAgKiBcbiAgICAgKiBcbiAgICoqL1xuICBjcmVhdGVVbmlxdWVJRDMyKCkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICBjb25zdCB0aW1lc3RhbXAgPSBEYXRlLm5vdygpLnRvU3RyaW5nKDE2KTsgLy8gR2V0IGN1cnJlbnQgdGltZSBpbiBoZXhcbiAgICAgIGNvbnN0IHJhbmRvbVBhcnQgPSAneHh4eHh4eHh4eHh4eHh4eCcucmVwbGFjZSgveC9nLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogMTYgfCAwKS50b1N0cmluZygxNik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aW1lc3RhbXAgKyByYW5kb21QYXJ0LnNsaWNlKDAsIDE2KTsgLy8gQ29tYmluZSB0aW1lc3RhbXAgd2l0aCByYW5kb20gcGFydFxuICB9XG5cbiAgcHJpdmF0ZSBwb3N0KG1ldGhvZDogc3RyaW5nLCBib2R5OiB7fSkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICBmb3IgKHZhciBba2V5LCBvYmpdIG9mIE9iamVjdC5lbnRyaWVzPGFueT4oYm9keSkpIHtcbiAgICAgIGlmIChrZXkgPT0gJ3ZhbHVlcycpIHtcbiAgICAgICAgZm9yICh2YXIgW2ZpZWxkLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMob2JqKSkge1xuICAgICAgICAgIG9ialtmaWVsZF0gPSB2YWx1ZSA/PyAnJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKHtcbiAgICAgICdYLVJlcXVlc3RlZC1XaXRoJzogJ1hNTEh0dHBSZXF1ZXN0JyxcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfSk7XG4gICAgY29uc3Qgc2FsdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdDxhbnk+KFxuICAgICAgdGhpcy5jb25maWc/LmFwaSArICc/JyArIHNhbHQsXG4gICAgICBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICB7XG4gICAgICAgICAgICBBUElfS0VZOiB0aGlzLmNvbmZpZz8uYXBpS2V5LFxuICAgICAgICAgICAgQXBwOiB0aGlzLmNvbmZpZz8uYXBwLFxuICAgICAgICAgICAgTWV0aG9kOiBtZXRob2QsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBib2R5XG4gICAgICAgIClcbiAgICAgICksXG4gICAgICB7IGhlYWRlcnMgfVxuICAgICk7XG4gIH1cblxuICBcbiAgLy8gQ1JFQVRFIFJFQUQgVVBEQVRFIEFORCBERUxFVEUgSEFORExFUlNcblxuICAvKipcbiAgICAgKiBSdW5zIGFuIGluc2VydCBxdWVyeSB0byB0aGUgc2VydmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHBvc3RPYmplY3QgLSBBbiBvYmplY3QgY29udGFpbmluZyB0YWJsZXMsIGFuZCB2YWx1ZXMgZm9yIHRoZSBTUUwgcXVlcnkuXG4gICAgICogQHJldHVybnMgQSByZXNwb3NlIG9iamVjdCBcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZGV0YWlscy5wYXNzd29yZCA9IHRoaXMuQVBJLmhhc2goZGV0YWlscy5wYXNzd29yZCk7XG4gICAgICogXG4gICAgICogY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuQVBJLmNyZWF0ZSh7XG4gICAgICogICB0YWJsZXM6ICdhZG1pbicsXG4gICAgICogICB2YWx1ZXM6IHtcbiAgICAgKiAgICAnZW1haWwnOnRoaXMuQVBJLmNvcmVGb3JtWydlbWFpbCddLFxuICAgICAqICAgICdwYXNzd29yZCc6IHRoaXMuQVBJLmNvcmVGb3JtWydwYXNzd29yZCddLCBcbiAgICAgKiAgfSxcbiAgICAgKiB9KTtcbiAgICAgKiBcbiAgICAgKiBpZihkYXRhLnN1Y2Nlc3Mpe1xuICAgICAqICBjb25zb2xlLmxvZyhkYXRhLm91dHB1dCk7XG4gICAgICogfVxuICAgICAqIFxuICAgKiovXG4gIGFzeW5jIGNyZWF0ZShwb3N0T2JqZWN0OkNvcmVDcmVhdGVPYmplY3QpOlByb21pc2U8Q29yZVJlc3BvbnNlPntcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgcmV0dXJuICBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLnBvc3QoJ2NyZWF0ZV9lbnRyeScsIHtcbiAgICAgICdkYXRhJzogSlNPTi5zdHJpbmdpZnkocG9zdE9iamVjdCksXG4gICAgfSkpO1xuICB9XG5cbiAgLyoqXG4gICAgICogUnVucyBhbiByZWFkIHF1ZXJ5IHRvIHRoZSBzZXJ2ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcG9zdE9iamVjdCAtIEFuIG9iamVjdCBjb250YWluaW5nIHNlbGVjdG9ycywgdGFibGVzLCBhbmQgY29uZGl0aW9ucyBmb3IgdGhlIFNRTCBxdWVyeS5cbiAgICAgKiBAcmV0dXJucyBBIHJlc3Bvc2Ugb2JqZWN0IFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5BUEkucmVhZCh7XG4gICAgICogICBzZWxlY3RvcnM6IFtcbiAgICAgKiAgICAgJ2ZfYWRtaW4uSUQnLFxuICAgICAqICAgICAnVXNlcm5hbWUnLFxuICAgICAqICAgICAnRW1haWwnLFxuICAgICAqICAgICAnQ09VTlQoZl9tZXNzYWdlcy5JRCkgYXMgaW5ib3gnXG4gICAgICogICBdLFxuICAgICAqICAgdGFibGVzOiAnZl9hZG1pbicsXG4gICAgICogICBjb25kaXRpb25zOiBgV0hFUkUgZW1haWwgPSAke3RoaXMuQVBJLmNvcmVGb3JtWydlbWFpbCddfWBcbiAgICAgKiB9KTtcbiAgICAgKiBcbiAgICAgKiBpZihkYXRhLnN1Y2Nlc3MgJiYgZGF0YS5vdXRwdXQubGVuZ3RoID4gMCl7XG4gICAgICogLy8gc2luZ2xlIG91dHB1dFxuICAgICAqICBjb25zb2xlLmxvZyhkYXRhLm91dHB1dFswXSk7XG4gICAgICogLy8gYWxsIG91dHRwdXRcbiAgICAgKiAgZm9yKGxldCByb3cgb2YgZGF0YS5vdXRwdXQpe1xuICAgICAqICAgIGNvbnNvbGUubG9nKHJvdyk7XG4gICAgICogIH1cbiAgICAgKiB9XG4gICAgICogXG4gICAqKi9cbiAgYXN5bmMgcmVhZChwb3N0T2JqZWN0OkNvcmVSZWFkT2JqZWN0KTpQcm9taXNlPENvcmVSZXNwb25zZT57XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLnBvc3QoJ2dldF9lbnRyaWVzJywge1xuICAgICAgJ2RhdGEnOiBKU09OLnN0cmluZ2lmeShwb3N0T2JqZWN0KSxcbiAgICB9KSk7XG4gIH1cbiAgIC8qKlxuICAgICAqIFJ1bnMgYW4gdXBkYXRlIHF1ZXJ5IHRvIHRoZSBzZXJ2ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcG9zdE9iamVjdCAtIEFuIG9iamVjdCBjb250YWluaW5nIHNlbGVjdG9ycywgdmFsdWVzICx0YWJsZXMsIGFuZCBjb25kaXRpb25zIGZvciB0aGUgU1FMIHF1ZXJ5LlxuICAgICAqIEByZXR1cm5zIEEgcmVzcG9zZSBvYmplY3QgXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGVuY3J5cHRlZCA9IHRoaXMuQVBJLmhhc2godGhpcy5BUEkuY29yZUZvcm1bJ3Bhc3N3b3JkJ10pO1xuICAgICAqIFxuICAgICAqIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLkFQSS51cGRhdGUoe1xuICAgICAqICAgdGFibGVzOiAnZl9hZG1pbicsXG4gICAgICogICB2YWx1ZXM6IHtcbiAgICAgKiAgICAnZW1haWwnOnRoaXMuQVBJLmNvcmVGb3JtWydlbWFpbCddLFxuICAgICAqICAgICdwYXNzd29yZCc6IGVuY3J5cHRlZCwgXG4gICAgICogICB9LFxuICAgICAqICAgY29uZGl0aW9uczogYFdIRVJFIGVtYWlsID0gJHt0aGlzLkFQSS5jb3JlRm9ybVsnZW1haWwnXX1gXG4gICAgICogfSk7XG4gICAgICogXG4gICAgICogaWYoZGF0YS5zdWNjZXNzKXtcbiAgICAgKiAgIGNvbnNvbGUubG9nKGRhdGEub3V0cHV0KTtcbiAgICAgKiB9XG4gICAgICogXG4gICAqKi9cbiAgYXN5bmMgdXBkYXRlKHBvc3RPYmplY3Q6Q29yZVVwZGF0ZU9iamVjdCk6UHJvbWlzZTxDb3JlUmVzcG9uc2U+e1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgIHJldHVybiBmaXJzdFZhbHVlRnJvbSggdGhpcy5wb3N0KCd1cGRhdGVfZW50cnknLCB7XG4gICAgJ2RhdGEnOiBKU09OLnN0cmluZ2lmeShwb3N0T2JqZWN0KSxcbiAgfSkpO1xuICB9XG5cbiAgLyoqXG4gICAgICogUnVucyBhbiBkZWxldGUgcXVlcnkgdG8gdGhlIHNlcnZlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwb3N0T2JqZWN0IC0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGFibGVzLCBhbmQgY29uZGl0aW9ucyBmb3IgdGhlIFNRTCBxdWVyeS5cbiAgICAgKiBAcmV0dXJucyBBIHJlc3Bvc2Ugb2JqZWN0IFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5BUEkuZGVsZXRlKHtcbiAgICAgKiAgIHRhYmxlczogJ2ZfYWRtaW4nLFxuICAgICAqICAgY29uZGl0aW9uczogYFdIRVJFIGVtYWlsID0gJHt0aGlzLkFQSS5jb3JlRm9ybVsnZW1haWwnXX1gXG4gICAgICogfSk7XG4gICAgICogXG4gICAgICogaWYoZGF0YS5zdWNjZXNzKXtcbiAgICAgKiAgIGNvbnNvbGUubG9nKGRhdGEub3V0cHV0KTtcbiAgICAgKiB9XG4gICAgICogXG4gICAqKi9cbiAgYXN5bmMgZGVsZXRlKHBvc3RPYmplY3Q6Q29yZURlbGV0ZU9iamVjdCk6UHJvbWlzZTxDb3JlUmVzcG9uc2U+e1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICByZXR1cm4gYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5wb3N0KCdkZWxldGVfZW50cnknLCB7XG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShwb3N0T2JqZWN0KSxcbiAgICB9KSlcbiAgfVxuXG4gIC8vIEZJTEUgSEFORExFUlNcblxuICAgLyoqXG4gICAgICogR2V0IGNvbXBsZXRlIGZpbGUgVVJMIGZyb20gdGhlIHNlcnZlclxuICAgICAqXG4gICAgICogQHBhcmFtIGZpbGUgLSBBIHN0cmluZyB0aGF0IHBvaW50cyB0byB0aGUgZmlsZS5cbiAgICAgKiBAcmV0dXJucyBBIGNvbXBsZXRlIHVybCBzdHJpbmcgZnJvbSB0aGUgc2VydmVyIFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCB1cmwgPSB0aGlzLkFQSS5nZXRGaWxlVVJMKCdmaWxlcy9wcm9maWxlLnBuZycpO1xuICAgICAqIFxuICAgICAqIE9VVFBVVDpcbiAgICAgKiAgaHR0cHM6Ly9sb2NhbGhvc3Q6ODA4MC9maWxlcy9wcm9maWxlLnBuZ1xuICAgICAqIFxuICAgKiovXG4gIGdldEZpbGVVUkwoZmlsZTogc3RyaW5nKTpzdHJpbmd8dW5kZWZpbmVkIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoXCJQbGVhc2UgaW5pdGlhbGl6ZSB1c3dhZ29uIGNvcmUgb24gcm9vdCBhcHAuY29tcG9uZW50LnRzXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZmlsZSkge1xuICAgICAgaWYgKGZpbGUuaW5jbHVkZXMoJ2h0dHAnKSkgcmV0dXJuIGZpbGU7XG4gICAgICByZXR1cm4gdGhpcy5jb25maWc/LnNlcnZlciArIGAvJHt0aGlzLmNvbmZpZy5hcHB9L2AgKyBmaWxlIDtcbiAgICB9XG4gICAgcmV0dXJuIGZpbGU7XG4gIH1cblxuICAgLyoqXG4gICAgICogVXBsb2FkcyBhIGZpbGUgdG8gdGhlIHNlcnZlclxuICAgICAqXG4gICAgICogQHBhcmFtIGZpbGUgLSBBIEZpbGUgdG8gdXBsb2FkXG4gICAgICogQHBhcmFtIGZpbGVuYW1lIC0gQSBzdHJpbmcgdGhhdCBwb2ludHMgdG8gd2hlcmUgdGhlIGZpbGUgdG8gYmUgc3RvcmVkIGluIHRoZSBzZXJ2ZXJcbiAgICAgKiBAcGFyYW0gY2h1bmtTaXplIC0gQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBudW1iZXIgb2YgYnl0ZXMgdG8gdXBsb2FkIHBlciBjaHVua1xuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBcbiAgICAgKiBnZXRVcGxvYWRQcm9ncmVzcygpe1xuICAgICAqICByZXR1cm4gdGhpcy5BUEkudXBsb2FkUHJvZ3Jlc3NcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogYXdhaXQgdGhpcy5BUEkudXBsb2FkRmlsZShzb21lZmlsZSwgJ2ZpbGVzL3Byb2ZpbGUucG5nJyk7XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqIDxkaXY+e3tnZXRVcGxvYWRQcm9ncmVzcygpfX08ZGl2PiAvLyBkeW5hbWljYWxseSB1cGRhdGVzIHRoZSBwcm9ncmVzc1xuICAgKiovXG4gIHVwbG9hZEZpbGUoZmlsZTogRmlsZSwgZmlsZW5hbWU6IHN0cmluZywgY2h1bmtTaXplOiBudW1iZXIgPSAxMDI0ICogMTAyNCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydChcIlBsZWFzZSBpbml0aWFsaXplIHVzd2Fnb24gY29yZSBvbiByb290IGFwcC5jb21wb25lbnQudHNcIik7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKCk9PntyZXR1cm4gbnVsbH0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdG90YWxDaHVua3MgPSBNYXRoLmNlaWwoZmlsZS5zaXplIC8gY2h1bmtTaXplKTtcbiAgICAgIGxldCB1cGxvYWRlZENodW5rcyA9IDA7IC8vIFRyYWNrIHVwbG9hZGVkIGNodW5rc1xuXG4gICAgICBjb25zdCB1cGxvYWRDaHVuayA9IChjaHVua0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBjaHVua0luZGV4ICogY2h1bmtTaXplO1xuICAgICAgICBjb25zdCBlbmQgPSBNYXRoLm1pbihzdGFydCArIGNodW5rU2l6ZSwgZmlsZS5zaXplKTtcbiAgICAgICAgY29uc3QgY2h1bmsgPSBmaWxlLnNsaWNlKHN0YXJ0LCBlbmQpO1xuXG4gICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIHJlYWRlci5vbmxvYWRlbmQgPSAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgYmFzZTY0U3RyaW5nID0gKHJlYWRlci5yZXN1bHQgYXMgc3RyaW5nKS5zcGxpdCgnLCcpWzFdO1xuXG4gICAgICAgICAgY29uc3QgJHN1YiA9IHRoaXMuaHR0cFxuICAgICAgICAgICAgLnBvc3QodGhpcy5jb25maWc/Lm5vZGVzZXJ2ZXIgKyAnL2ZpbGVoYW5kbGVyLXByb2dyZXNzJywge1xuICAgICAgICAgICAgICBrZXk6IHRoaXMuY29uZmlnPy5hcGlLZXksXG4gICAgICAgICAgICAgIGFwcDogdGhpcy5jb25maWc/LmFwcCxcbiAgICAgICAgICAgICAgbWV0aG9kOiAnY3JlYXRlX3VybCcsXG4gICAgICAgICAgICAgIGNodW5rOiBiYXNlNjRTdHJpbmcsXG4gICAgICAgICAgICAgIGZpbGVOYW1lOiAgZmlsZW5hbWUsXG4gICAgICAgICAgICAgIGNodW5rSW5kZXg6IGNodW5rSW5kZXgsXG4gICAgICAgICAgICAgIHRvdGFsQ2h1bmtzOiB0b3RhbENodW5rcyxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICAgbmV4dDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHVwbG9hZGVkQ2h1bmtzKys7XG4gICAgICAgICAgICAgICAgdGhpcy51cGxvYWRQcm9ncmVzcyA9IE1hdGgucm91bmQoKHVwbG9hZGVkQ2h1bmtzIC8gdG90YWxDaHVua3MpICogMTAwKTtcbiAgICAgICAgICAgICAgICBpZiAoY2h1bmtJbmRleCArIDEgPCB0b3RhbENodW5rcykge1xuICAgICAgICAgICAgICAgICAgLy8gVXBsb2FkIG5leHQgY2h1bmtcbiAgICAgICAgICAgICAgICAgIHVwbG9hZENodW5rKGNodW5rSW5kZXggKyAxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYEZpbGUgdXBsb2FkIGNvbXBsZXRlOiAke2ZpbGVuYW1lfWApO1xuICAgICAgICAgICAgICAgICAgdGhpcy51cGxvYWRQcm9ncmVzcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICRzdWIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTsgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSB3aGVuIHRoZSB1cGxvYWQgaXMgY29tcGxldGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGVycm9yOiAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgJHN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwbG9hZGluZyBjaHVuaycsIGVycik7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7IC8vIFJlamVjdCB0aGUgcHJvbWlzZSBvbiBlcnJvclxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoY2h1bmspO1xuICAgICAgfTtcblxuICAgICAgLy8gU3RhcnQgdXBsb2FkaW5nIHRoZSBmaXJzdCBjaHVua1xuICAgICAgdXBsb2FkQ2h1bmsoMCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBkaXNwb3NlRmlsZShmaWxlbmFtZTogc3RyaW5nKXtcbiAgICAgIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMuaHR0cFxuICAgICAgLnBvc3QodGhpcy5jb25maWc/Lm5vZGVzZXJ2ZXIgKyAnL2ZpbGVoYW5kbGVyLXByb2dyZXNzJywge1xuICAgICAgICBrZXk6IHRoaXMuY29uZmlnPy5hcGlLZXksXG4gICAgICAgIGFwcDogdGhpcy5jb25maWc/LmFwcCxcbiAgICAgICAgbWV0aG9kOiAnZGVsZXRlX3VybCcsXG4gICAgICAgIGZpbGVOYW1lOiAgZmlsZW5hbWUsXG4gICAgICB9KSlcbiAgICAgIDtcbiAgfTtcbiAgXG59XG4iXX0=