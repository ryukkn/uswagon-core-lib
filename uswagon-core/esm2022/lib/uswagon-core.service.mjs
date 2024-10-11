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
      * this.API.addLiveListener('event-1',(message)=>{
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
        const response = await this.post('get_hash', { text: text });
        if (response.success) {
            return response.output;
        }
        else {
            throw new Error('Server Error');
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
        const response = await this.post('encrypt', { text: text });
        if (response.success) {
            return response.output;
        }
        else {
            throw new Error('Server Error');
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
        const response = await this.post('decrypt', { encrypted: encrypted });
        if (response.success) {
            return response.output;
        }
        else {
            throw new Error('Server Error');
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
        const response = await this.post('verify_hash', { text: text, hash: hash });
        if (response.success) {
            return response.output;
        }
        else {
            throw new Error('Server Error');
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
    async encryptRequest(plaintext) {
        const keyString = 'AHS8576598PIOUNA214842780309mpqbH';
        const key = new TextEncoder().encode(keyString.slice(0, 32)); // Use only the first 32 characters for AES-256
        const iv = crypto.getRandomValues(new Uint8Array(16)); // Generate random IV (16 bytes for AES)
        // Import the key
        const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-CBC' }, false, ['encrypt']);
        // Encrypt the plaintext
        const encodedPlaintext = new TextEncoder().encode(plaintext);
        const ciphertext = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: iv }, cryptoKey, encodedPlaintext);
        // Combine IV and ciphertext, then encode to base64
        const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(ciphertext), iv.byteLength);
        // Convert to base64
        return btoa(String.fromCharCode(...combined));
    }
    async post(method, body) {
        if (this.config == undefined) {
            alert('Config must be initialized, try service.initialize(config)');
        }
        for (var [key, obj] of Object.entries(body)) {
            if (key == 'values') {
                for (var [field, value] of Object.entries(obj)) {
                    if (value == null || value == undefined) {
                        delete obj[field];
                    }
                }
            }
        }
        const headers = new HttpHeaders({
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        });
        const salt = new Date().getTime();
        const jsonString = JSON.stringify(Object.assign({
            API_KEY: this.config?.apiKey,
            App: this.config?.app,
            Method: method,
        }, body));
        const encrypted = await this.encryptRequest(jsonString);
        return await firstValueFrom(this.http.post(this.config?.api + '?' + salt, encrypted, { headers }));
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
        return await this.post('create_entry', {
            'data': JSON.stringify(postObject),
        });
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
        return await this.post('get_entries', {
            'data': JSON.stringify(postObject),
        });
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
        return await this.post('update_entry', {
            'data': JSON.stringify(postObject),
        });
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
        return await this.post('delete_entry', {
            data: JSON.stringify(postObject),
        });
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
            if (file.includes('http://') || file.includes('https://'))
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1jb3JlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWNvcmUvc3JjL2xpYi91c3dhZ29uLWNvcmUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBYSxNQUFNLGVBQWUsQ0FBQztBQUd0RCxPQUFPLEVBQVUsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBSzlDLE1BQU0sT0FBTyxrQkFBa0I7SUEyQzdCLFlBQ1UsSUFBZ0IsRUFDaEIsTUFBYztRQURkLFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQWxDdkI7Ozs7Ozs7O1dBUUc7UUFDRyxjQUFTLEdBQVcsS0FBSyxDQUFDO1FBR3pCLGVBQVUsR0FBWSxFQUFFLENBQUE7UUFDL0I7Ozs7Ozs7Ozs7O1dBV0c7UUFDRyxhQUFRLEdBQVksRUFBRSxDQUFBO1FBSXJCLGVBQVUsR0FBcUQsRUFBRSxDQUFDO0lBTXRFLENBQUM7SUFFTCxpQkFBaUI7SUFDakI7Ozs7Ozs7Ozs7Ozs7UUFhSTtJQUNKLFVBQVUsQ0FBQyxNQUFpQjtRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxhQUFhLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU8sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxPQUFPLEVBQUMsRUFBRTtZQUNsQyxJQUFJLGNBQWMsR0FBRyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25F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QUFNLEVBQUUsTUFBTTtZQUN4QixHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHO1lBQ3JCLE1BQU0sRUFBRSxZQUFZO1lBQ3BCLFFBQVEsRUFBRyxRQUFRO1NBQ3BCLENBQUMsQ0FBQyxDQUNGO0lBQ0wsQ0FBQztJQUFBLENBQUM7K0dBeHJCUyxrQkFBa0I7bUhBQWxCLGtCQUFrQixjQUZqQixNQUFNOzs0RkFFUCxrQkFBa0I7a0JBSDlCLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cENsaWVudCwgSHR0cEhlYWRlcnMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBJbmplY3RhYmxlLCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBDb3JlQ29uZmlnLCBDb3JlQ3JlYXRlT2JqZWN0LCBDb3JlRGVsZXRlT2JqZWN0LCBDb3JlRm9ybSwgQ29yZVJlYWRPYmplY3QsIENvcmVSZXNwb25zZSwgQ29yZVVwZGF0ZU9iamVjdCwgU25hY2tiYXJDb3JlRmVlZGJhY2sgfSBmcm9tICcuL3R5cGVzL3Vzd2Fnb24tY29yZS50eXBlcyc7XG5pbXBvcnQgeyAgZmlyc3QsIGZpcnN0VmFsdWVGcm9tIH0gZnJvbSAncnhqcyc7XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIFVzd2Fnb25Db3JlU2VydmljZSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gICAvKipcbiAgICAgKiBVcGxvYWQgcHJvZ3Jlc3MgaW5kaWNhdG9yIG9uIGN1cnJlbnQgZmlsZSB1cGxvYWRcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGdldFVwbG9hZFByb2dyZXNzKCl7XG4gICAgICogIHJldHVybiB0aGlzLkFQSS51cGxvYWRQcm9ncmVzcztcbiAgICAgKiB9XG4gICAgICogIFxuICAgKiovXG4gIHB1YmxpYyB1cGxvYWRQcm9ncmVzcz86bnVtYmVyO1xuICAgLyoqXG4gICAgICogR2V0IGxvYWRpbmcgc3RhdHVzIG9mIHRoZSBBUElcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGdldFVwbG9hZFByb2dyZXNzKCl7XG4gICAgICogIHJldHVybiB0aGlzLkFQSS5pc0xvYWRpbmc7XG4gICAgICogfVxuICAgICAqICBcbiAgICoqL1xuICBwdWJsaWMgaXNMb2FkaW5nOmJvb2xlYW4gPSBmYWxzZTtcblxuICBwcml2YXRlIGNvcmVGZWVkYmFjaz86U25hY2tiYXJDb3JlRmVlZGJhY2s7XG4gIHByaXZhdGUgcHVibGljRm9ybTpDb3JlRm9ybSA9IHt9XG4gICAvKipcbiAgICAgKiBTZWN1cmUgZm9ybSBmb3Igc3RvcmluZyBtb3JlIHNlY3VyZSBpbnB1dFxuICAgICAqIFxuICAgICAqIE5PVEU6IFRoaXMgaXMgdGhlIGZvcm0gdGhhdCBzaG91bGQgYmUgdXNlZCB3aGVuIGJ1aWxkaW5nIHBvc3RPYmplY3RzXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBmb3IobGV0IGtleSBpbiB0aGlzLkFQSS5jb3JlRm9ybSl7XG4gICAgICogIC8vIHByb2Nlc3MgdmFsdWVcbiAgICAgKiAgY29uc29sZS5sb2codGhpcy5BUEkuY29yZUZvcm1ba2V5XSk7XG4gICAgICogfVxuICAgICAqIFxuICAgKiovXG4gIHB1YmxpYyBjb3JlRm9ybTpDb3JlRm9ybSA9IHt9XG4gIHByaXZhdGUgc29ja2V0PzogV2ViU29ja2V0O1xuICBwcml2YXRlIGNvbmZpZz86IENvcmVDb25maWc7XG4gIHByaXZhdGUgdGltZW91dDphbnk7XG4gIHByaXZhdGUgbGl2ZUV2ZW50czp7W2tleTogc3RyaW5nXTogKG1lc3NhZ2U6IE1lc3NhZ2VFdmVudCkgPT4gdm9pZCB9ID0ge307XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcbiAgKSB7IH1cblxuICAvLyBJTklUSUFMSVpBVElPTlxuICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgc2VydmljZSBmb3IgdGhlIHByb2plY3RcbiAgICAgKiBAcGFyYW0gY29uZmlnIC0gY29uZmlndXJhdGlvbiB0aGF0IHBvaW50cyB0aGUgc2VydmljZSB0byBpdHMgYXBwcm9wcmlhdGUgc2VydmVyXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0aGlzLkFQSS5pbml0aWFsaXplKHtcbiAgICAgKiAgYXBpOmVudmlyb25tZW50LmFwaSxcbiAgICAgKiAgYXBpS2V5OiBlbnZpcm9ubWVudC5hcGlLZXksXG4gICAgICogIG5vZGVzZXJ2ZXI6IGVudmlyb25tZW50Lm5vZGVzZXJ2ZXIsXG4gICAgICogIHNlcnZlcjogZW52aXJvbm1lbnQuc2VydmVyLFxuICAgICAqICBzb2NrZXQ6IGVudmlyb25tZW50LnNvY2tldFxuICAgICAqIH0pXG4gICAgICogXG4gICAqKi9cbiAgaW5pdGlhbGl6ZShjb25maWc6Q29yZUNvbmZpZyl7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KGNvbmZpZy5zb2NrZXQpO1xuICAgIHRoaXMuc29ja2V0LmJpbmFyeVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICAgIHRoaXMuc29ja2V0IS5vbm1lc3NhZ2UgPSAobWVzc2FnZSk9PntcbiAgICAgIHZhciBkZWNvZGVkTWVzc2FnZSA9IG5ldyBUZXh0RGVjb2RlcigndXRmLTgnKS5kZWNvZGUobWVzc2FnZS5kYXRhKTtcbiAgICAgIGNvbnN0IHNvY2tldERhdGEgPSBKU09OLnBhcnNlKGRlY29kZWRNZXNzYWdlKTtcbiAgICAgIGlmKHNvY2tldERhdGEuYXBwICE9IGNvbmZpZy5hcHApIHJldHVybjtcbiAgICAgIGZvciAoY29uc3QgaWQgaW4gdGhpcy5saXZlRXZlbnRzKSB7XG4gICAgICAgICAgdGhpcy5saXZlRXZlbnRzW2lkXShzb2NrZXREYXRhLmRhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gICAvKipcbiAgICAgKiBBZGQgYSBuZXcgbGl2ZSBsaXN0ZW5lciBmcm9tIHRoZSBzZXJ2ZXIncyB3ZWJzb2NrZXRcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gaWQgLSBVbmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIGxpc3RlbmVycyB0byBhdm9pZCBjb2xsaXNpb25zXG4gICAgICogQHBhcmFtIGhhbmRsZXIgLSBXZWJzb2NrZXQgbWVzc2FnZXMgYXJlIHBhc3NlZCB0byB0aGlzIGhhbmRsZXJcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdGhpcy5BUEkuYWRkTGl2ZUxpc3RlbmVyKCdldmVudC0xJywobWVzc2FnZSk9PntcbiAgICAgKiAgT1VUUFVUOlxuICAgICAqICAvLyBzYW1lIGFzIHRoZSBqc29uIHNlbnQgZnJvbSBzb2NrZXRTZW5kKGRhdGEpXG4gICAgICogIC8vIGxvZ2ljcyBhcmUgYXBwbGllZCBoZXJlIHNvIHRoYXQgbWVzc2FnZXMgYXJlIG9ubHkgcmVjZWl2ZWQgb24gc3BlY2lmaWMgY2xpZW50c1xuICAgICAqICBjb25zb2xlLmxvZyhtZXNzYWdlKTtcbiAgICAgKiB9KVxuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIGFkZFNvY2tldExpc3RlbmVyKCBpZDpzdHJpbmcsaGFuZGxlcjoobWVzc2FnZTogYW55KT0+dm9pZCkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICB0aGlzLmxpdmVFdmVudHNbaWRdPSBoYW5kbGVyO1xuICB9XG4gIC8qKlxuICAgICAqIEdldCBsaXN0IG9mIGxpdmUgbGlzdGVuZXJzIGluIHRoZSBwcm9qZWN0XG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLmdldExpc3RlbmVycygpO1xuICAgICAqIFxuICAgICAqIE9VVFBVVDogQW4gYWxlcnQgc2hvd2luZyBsaXN0IG9mIGxpc3RlbmVyc1xuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIGdldExpc3RlbmVycygpIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgYWxlcnQoSlNPTi5zdHJpbmdpZnkoT2JqZWN0LmtleXModGhpcy5saXZlRXZlbnRzKSkpO1xuICB9XG4gIC8qKlxuICAgICAqIFNlbmRzIGEgbWVzc2FnZSB0byB0aGUgd2Vic29ja2V0XG4gICAgICogQHBhcmFtIGRhdGEgLSBBIGpzb24gb2JqZWN0IG1lc3NhZ2VcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdGhpcy5BUEkuc29ja2V0U2VuZCh7XG4gICAgICogICAgdG86IHN0dWRlbnQuaWQsXG4gICAgICogICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgKiB9KVxuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIHNvY2tldFNlbmQoZGF0YTogb2JqZWN0KSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIHRoaXMuc29ja2V0IS5vbm9wZW4gPSAoKT0+e1xuICAgICAgdGhpcy5zb2NrZXQhLnNlbmQoXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHsga2V5OiB0aGlzLmNvbmZpZz8uYXBpS2V5LCBhcHA6IHRoaXMuY29uZmlnPy5hcHAsIGRhdGE6IGRhdGEgfSlcbiAgICAgICk7XG4gICAgfVxuICB9XG4gIFxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLnNvY2tldD8uY2xvc2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgcGdFc2NhcGVTdHJpbmcoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW5wdXQgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgIH0gXG4gICAgLy8gRXNjYXBlIHNpbmdsZSBxdW90ZXMgYnkgcmVwbGFjaW5nIHRoZW0gd2l0aCB0d28gc2luZ2xlIHF1b3Rlc1xuICAgIHJldHVybiBpbnB1dC5yZXBsYWNlKC8nL2csIFwiJydcIikudHJpbSgpO1xuICB9XG5cbiAgLyoqXG4gICAgICogQnVpbGRzIGEgQ29yZUZvcm0gZnJvbSB1c2VyIGlucHV0XG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5IC0gQSBzdHJpbmcgcmVmZXJlbmNlIHRvIGZvcm0ga2V5XG4gICAgICogQHBhcmFtIHZhbHVlIC0gQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiBhIGZvcm0ga2V5XG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBcbiAgICAgKiBoYW5kbGVJbnB1dChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyl7XG4gICAgICogIHRoaXMuQVBJLmhhbmRsZUZvcm1WYWx1ZSgnZW1haWwnLCBldmVudC50YXJnZXQudmFsdWUpOyAvLyBrZXkgc2hvdWxkIGJlIGluaXRpYWxpemVkIHVzaW5nIGluaXRpYWxpemVGb3JtKClcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqIDxpbnB1dCAoY2hhbmdlKT0naGFuZGxlSW5wdXQoXCJlbWFpbFwiLCAkZXZlbnQpJyA+IFxuICAgICAqXG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgaGFuZGxlRm9ybVZhbHVlKGtleTpzdHJpbmcsIHZhbHVlOnN0cmluZyl7XG4gICAgdGhpcy5wdWJsaWNGb3JtW2tleV0gPSB2YWx1ZTsgXG4gICAgdGhpcy5jb3JlRm9ybVtrZXldID0gdGhpcy5wZ0VzY2FwZVN0cmluZyh2YWx1ZSk7XG4gIH1cbiAgIC8qKlxuICAgICAqIEJ1aWxkcyBhIENvcmVGb3JtIGZyb20gdXNlciBpbnB1dFxuICAgICAqXG4gICAgICogQHBhcmFtIGtleSAtIEEgc3RyaW5nIHJlZmVyZW5jZSB0byBmb3JtIGtleVxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogXG4gICAgICogZ2V0SW5wdXQoa2V5OnN0cmluZyl7XG4gICAgICogIHJldHVybiB0aGlzLkFQSS5nZXRGb3JtVmFsdWUoa2V5KTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqIDxkaXY+e3tnZXRJbnB1dCgnZW1haWwnKX19PC9kaXY+XG4gICAgICogXG4gICAqKi9cbiAgIGdldEZvcm1WYWx1ZShrZXk6c3RyaW5nKXtcbiAgICBpZih0aGlzLnB1YmxpY0Zvcm1ba2V5XSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdQbGVhc2UgaW5pdGlhbGl6ZSB0aGUgZm9ybSB1c2luZyBpbml0aWFsaXplRm9ybShbLi4uZmllbGRzXSknKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHVibGljRm9ybVtrZXldO1xuICB9XG5cbiAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBhIENvcmVGb3JtXG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5cyAtIEEgbGlzdCBvZiBzdHJpbmdzIHJlcHJlc2VudGluZyBmb3JtIGtleXNcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLmluaXRpYWxpemVGb3JtKFsnZW1haWwnXSk7XG4gICAgICogIFxuICAgICAqIE9VVFBVVDpcbiAgICAgKiBjb25zb2xlLmxvZyh0aGlzLkFQSS5jb3JlRm9ybSk7IFxuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIGluaXRpYWxpemVGb3JtKGtleXM6c3RyaW5nW10pe1xuICAgIHRoaXMucHVibGljRm9ybSA9IGtleXMucmVkdWNlKChwcmV2OmFueSxjdXJyOmFueSk9PntcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHByZXYsIHtbY3Vycl06Jyd9KVxuICAgIH0se30pXG4gICAgdGhpcy5jb3JlRm9ybSA9IGtleXMucmVkdWNlKChwcmV2OmFueSxjdXJyOmFueSk9PntcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHByZXYsIHtbY3Vycl06Jyd9KVxuICAgIH0se30pXG4gIH1cblxuICAvLyBVVElMSVRJRVNcbiAgLyoqXG4gICAgICogTWFyayB0aGUgc3RhdHVzIG9mIHRoZSBBUEkgYXMgbG9hZGluZ1xuICAgICAqXG4gICAgICogQHBhcmFtIGlzTG9hZGluZyAtIEEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIEFQSSBpcyBsb2FkaW5nXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBcbiAgICAgKiB0aGlzLkFQSS5zZXRMb2FkaW5nKHRydWUpXG4gICAgICogXG4gICAgICogY29uc29sZS5sb2codGhpcy5BUEkuaXNMb2FkaW5nKTtcbiAgICAgKiBcbiAgICoqL1xuICBzZXRMb2FkaW5nKGlzTG9hZGluZzpib29sZWFuKXtcbiAgICB0aGlzLmlzTG9hZGluZyA9IGlzTG9hZGluZztcbiAgfVxuXG4gIC8qKlxuICAgICAqIENyZWF0ZXMgYSBoYXNoIGZyb20gdGhlIHNlcnZlciBmb3IgZW5jcnlwdGluZyBkYXRhXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZW5jcnlwdCAtIEEgc3RyaW5nIHRvIGVuY3J5cHRcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFxuICAgICAqIHRoaXMuQVBJLnNlbmRGZWVkYmFjaygnc3VjY2VzcycsICdQdXNoZWQgZGF0YSEnKVxuICAgICAqIFxuICAgKiovXG4gICAgc2VuZEZlZWRiYWNrKHR5cGU6J3N1Y2Nlc3MnfCdlcnJvcid8J25ldXRyYWwnfCd3YXJuaW5nJyxtZXNzYWdlOnN0cmluZywgdGltZXI/Om51bWJlcil7XG4gICAgICB0aGlzLmNvcmVGZWVkYmFjayA9IHtcbiAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKHRpbWVyICE9IHVuZGVmaW5lZCkge1xuICAgICAgICBpZih0aGlzLnRpbWVvdXQpe1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNldCBhIHRpbWVyIHRvIHJlc2V0IHRoZSBzbmFja2JhciBmZWVkYmFjayBhZnRlciAyIHNlY29uZHNcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuY29yZUZlZWRiYWNrID0gdW5kZWZpbmVkO1xuICAgICAgICB9LCB0aW1lcik7XG4gICAgICB9XG4gICAgfVxuICAvKipcbiAgICAgKiBTdG9yZSBBUEkgZmVlZGJhY2sgZm9yIHNuYWNrYmFycyBhbmQgb3RoZXIgZGlzcGxheSBmZWVkYmFja1xuICAgICAqIFxuICAgICAqIEByZXR1cm5zIC0gQSBmZWVkYmFjayBvYmplY3Qgd2l0aCB7dHlwZSwgbWVzc2FnZX1cbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFxuICAgICAqIGdldEZlZWRiYWNrKCl7XG4gICAgICogICByZXR1cm4gdGhpcy5BUEkuZ2V0RmVlZGJhY2soKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqICAvLyBTbmFja2JhcnMgaW4gYXBwLmNvbXBvbmVudC50cyAocm9vdClcbiAgICAgKiAgPGRpdiBjbGFzcz0nc25hY2tiYXInICpuZ0lmPSdnZXRGZWVkYmFjaygpLnR5cGUgIT0gdW5kZWZpbmVkJz4gU29tZSBGZWVkYmFjayA8L2Rpdj5cbiAgICAgKiBcbiAgICAgKiBcbiAgICoqL1xuICAgIGdldEZlZWRiYWNrKCl7XG4gICAgICByZXR1cm4gdGhpcy5jb3JlRmVlZGJhY2s7XG4gICAgfVxuICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGhhc2ggZnJvbSB0aGUgc2VydmVyIGZvciBub24gZGVjcnlwdGFibGUgZGF0YVxuICAgICAqXG4gICAgICogQHBhcmFtIHRleHQgLSBBIHN0cmluZyB0byBlbmNyeXB0XG4gICAgICogXG4gICAgICogQHJldHVybnMgQSBzdHJpbmcgaGFzaCBvciB0aHJvd3MgYW4gZXJyb3IgaWYgYW4gZXJyb3IgaGFzIG9jY3VyZWRcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgaGFzaCA9IHRoaXMuQVBJLmhhc2goJ2tlbicpO1xuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKGhhc2gpO1xuICAgICAqIFxuICAgKiovXG4gIGFzeW5jIGhhc2godGV4dDpzdHJpbmcpe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gIGF3YWl0IHRoaXMucG9zdCgnZ2V0X2hhc2gnLCB7dGV4dDogdGV4dH0pXG4gICAgaWYocmVzcG9uc2Uuc3VjY2Vzcyl7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub3V0cHV0O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXJ2ZXIgRXJyb3InKTtcblxuICAgIH1cbiAgfVxuICAgLyoqXG4gICAgICogRW5jcnlwdHMgYSB0ZXh0IFxuICAgICAqXG4gICAgICogQHBhcmFtIHRleHQgLSBBIHN0cmluZyB0byBlbmNyeXB0XG4gICAgICogXG4gICAgICogQHJldHVybnMgQSBzdHJpbmcgYW4gZW5jcnlwdGVkIHRleHQgb3IgdGhyb3dzIGFuIGVycm9yIGlmIGFuIGVycm9yIGhhcyBvY2N1cmVkXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGVuY3J5cHRlZCA9IHRoaXMuQVBJLmVuY3J5cHQoJ2tlbicpO1xuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKGVuY3J5cHRlZCk7XG4gICAgICogXG4gICAqKi9cbiAgIGFzeW5jIGVuY3J5cHQodGV4dDpzdHJpbmcpe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gIGF3YWl0IHRoaXMucG9zdCgnZW5jcnlwdCcsIHt0ZXh0OiB0ZXh0fSlcbiAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgIHJldHVybiByZXNwb25zZS5vdXRwdXQ7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlcnZlciBFcnJvcicpO1xuXG4gICAgfVxuICB9XG4gICAvKipcbiAgICAgKiBEZWNyeXB0IGFuIGVuY3J5cHRlZCB0ZXh0IGluIHRoZSBzZXJ2ZXIgdG8gZ2V0IHBsYWluIHRleHRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbmNyeXB0ZWQgLSBBIHN0cmluZyB0byBlbmNyeXB0XG4gICAgICogXG4gICAgICogQHJldHVybnMgQSBzdHJpbmcgdGhlIHBsYWluIHRleHQgb2YgYW4gZW5jcnlwdGVkIHRleHQgb3Igb3IgdGhyb3dzIGFuIGVycm9yIGlmIGFuIGVycm9yIGhhcyBvY2N1cmVkXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IHBsYWluVGV4dCA9IHRoaXMuQVBJLmRlY3J5cHQoJ0FzaTEyaVVTSURVQUlTRFUxMicpO1xuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKHBsYWluVGV4dCk7XG4gICAgICogXG4gICAqKi9cbiAgIGFzeW5jIGRlY3J5cHQoZW5jcnlwdGVkOnN0cmluZyl7XG4gICAgY29uc3QgcmVzcG9uc2UgPSAgYXdhaXQgdGhpcy5wb3N0KCdkZWNyeXB0Jywge2VuY3J5cHRlZDogZW5jcnlwdGVkfSlcbiAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgIHJldHVybiByZXNwb25zZS5vdXRwdXQ7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlcnZlciBFcnJvcicpO1xuICAgIH1cbiAgfVxuICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGEgdmFsdWUgbWF0Y2hlcyBhIGhhc2hcbiAgICAgKlxuICAgICAqIEBwYXJhbSB0ZXh0IC0gQSBzdHJpbmcgdG8gY2hlY2tcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gaGFzaCAtIEEgaGFzaCBzdHJpbmcgdG8gY2hlY2tcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyAtIFRydWUgaWYgdGV4dCBhbmQgaGFzaCBtYXRjaGVzLCBmYWxzZSBvdGhlcndpc2UuIFRocm93cyBhbiBlcnJvciBpZiBhbiBlcnJvciBoYXMgb2NjdXJyZWQuXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IG1hdGNoID0gdGhpcy5BUEkudmVyaWZ5SGFzaCgndGV4dCcsJyQyYWFzZGtrMi4xMjNpMTIzaWphc3VkZmtsYWpzZGxhJyk7XG4gICAgICogXG4gICAgICogY29uc29sZS5sb2cobWF0Y2gpO1xuICAgICAqIFxuICAgKiovXG4gICBhc3luYyB2ZXJpZnlIYXNoKHRleHQ6c3RyaW5nLGhhc2g6c3RyaW5nKXtcbiAgICBjb25zdCByZXNwb25zZSA9ICBhd2FpdCB0aGlzLnBvc3QoJ3ZlcmlmeV9oYXNoJywge3RleHQ6IHRleHQsIGhhc2g6aGFzaH0pXG4gICAgaWYocmVzcG9uc2Uuc3VjY2Vzcyl7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub3V0cHV0O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXJ2ZXIgRXJyb3InKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHVuaXF1ZSBpZGVudGlmaWVyIHdpdGggdGhlIGxlbmd0aCBvZiAzMlxuICAgICAqXG4gICAgICogQHJldHVybnMgQSByYW5kb20gdW5pcXVlIDMyIHN0cmluZyBpZGVudGlmaWVyXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGlkID0gdGhpcy5BUEkuY3JlYXRlVW5pcXVlSUQzMigpO1xuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIGNyZWF0ZVVuaXF1ZUlEMzIoKSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIGNvbnN0IHRpbWVzdGFtcCA9IERhdGUubm93KCkudG9TdHJpbmcoMTYpOyAvLyBHZXQgY3VycmVudCB0aW1lIGluIGhleFxuICAgICAgY29uc3QgcmFuZG9tUGFydCA9ICd4eHh4eHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC94L2csICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAxNiB8IDApLnRvU3RyaW5nKDE2KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRpbWVzdGFtcCArIHJhbmRvbVBhcnQuc2xpY2UoMCwgMTYpOyAvLyBDb21iaW5lIHRpbWVzdGFtcCB3aXRoIHJhbmRvbSBwYXJ0XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGVuY3J5cHRSZXF1ZXN0KHBsYWludGV4dDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBrZXlTdHJpbmcgPSAnQUhTODU3NjU5OFBJT1VOQTIxNDg0Mjc4MDMwOW1wcWJIJztcbiAgICBjb25zdCBrZXkgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoa2V5U3RyaW5nLnNsaWNlKDAsIDMyKSk7IC8vIFVzZSBvbmx5IHRoZSBmaXJzdCAzMiBjaGFyYWN0ZXJzIGZvciBBRVMtMjU2XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KDE2KSk7IC8vIEdlbmVyYXRlIHJhbmRvbSBJViAoMTYgYnl0ZXMgZm9yIEFFUylcblxuICAgIC8vIEltcG9ydCB0aGUga2V5XG4gICAgY29uc3QgY3J5cHRvS2V5ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAncmF3JyxcbiAgICAgIGtleSxcbiAgICAgIHsgbmFtZTogJ0FFUy1DQkMnIH0sXG4gICAgICBmYWxzZSxcbiAgICAgIFsnZW5jcnlwdCddXG4gICAgKTtcblxuICAgIC8vIEVuY3J5cHQgdGhlIHBsYWludGV4dFxuICAgIGNvbnN0IGVuY29kZWRQbGFpbnRleHQgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUocGxhaW50ZXh0KTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGl2OiBpdiB9LFxuICAgICAgY3J5cHRvS2V5LFxuICAgICAgZW5jb2RlZFBsYWludGV4dFxuICAgICk7XG5cbiAgICAvLyBDb21iaW5lIElWIGFuZCBjaXBoZXJ0ZXh0LCB0aGVuIGVuY29kZSB0byBiYXNlNjRcbiAgICBjb25zdCBjb21iaW5lZCA9IG5ldyBVaW50OEFycmF5KGl2LmJ5dGVMZW5ndGggKyBjaXBoZXJ0ZXh0LmJ5dGVMZW5ndGgpO1xuICAgIGNvbWJpbmVkLnNldChpdiwgMCk7XG4gICAgY29tYmluZWQuc2V0KG5ldyBVaW50OEFycmF5KGNpcGhlcnRleHQpLCBpdi5ieXRlTGVuZ3RoKTtcblxuICAgIC8vIENvbnZlcnQgdG8gYmFzZTY0XG4gICAgcmV0dXJuIGJ0b2EoU3RyaW5nLmZyb21DaGFyQ29kZSguLi5jb21iaW5lZCkpO1xuICB9XG5cbiAgYXN5bmMgcG9zdChtZXRob2Q6IHN0cmluZywgYm9keToge30pIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgZm9yICh2YXIgW2tleSwgb2JqXSBvZiBPYmplY3QuZW50cmllczxhbnk+KGJvZHkpKSB7XG4gICAgICBpZiAoa2V5ID09ICd2YWx1ZXMnKSB7XG4gICAgICAgIGZvciAodmFyIFtmaWVsZCwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKG9iaikpIHtcbiAgICAgICAgICBpZih2YWx1ZSA9PSBudWxsIHx8IHZhbHVlID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZGVsZXRlIG9ialtmaWVsZF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoe1xuICAgICAgJ1gtUmVxdWVzdGVkLVdpdGgnOiAnWE1MSHR0cFJlcXVlc3QnLFxuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICB9KTtcbiAgICBjb25zdCBzYWx0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgY29uc3QganNvblN0cmluZyA9IEpTT04uc3RyaW5naWZ5KFxuICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIEFQSV9LRVk6IHRoaXMuY29uZmlnPy5hcGlLZXksXG4gICAgICAgICAgICBBcHA6IHRoaXMuY29uZmlnPy5hcHAsXG4gICAgICAgICAgICBNZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGJvZHlcbiAgICAgICAgKVxuICAgICAgKTtcblxuICAgIGNvbnN0IGVuY3J5cHRlZCA9IGF3YWl0IHRoaXMuZW5jcnlwdFJlcXVlc3QoanNvblN0cmluZyk7XG4gICAgcmV0dXJuIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMuaHR0cC5wb3N0PGFueT4oXG4gICAgICB0aGlzLmNvbmZpZz8uYXBpICsgJz8nICsgc2FsdCxcbiAgICAgIGVuY3J5cHRlZCxcbiAgICAgIHsgaGVhZGVycyB9XG4gICAgKSk7XG4gIH1cblxuICBcbiAgLy8gQ1JFQVRFIFJFQUQgVVBEQVRFIEFORCBERUxFVEUgSEFORExFUlNcblxuICAvKipcbiAgICAgKiBSdW5zIGFuIGluc2VydCBxdWVyeSB0byB0aGUgc2VydmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHBvc3RPYmplY3QgLSBBbiBvYmplY3QgY29udGFpbmluZyB0YWJsZXMsIGFuZCB2YWx1ZXMgZm9yIHRoZSBTUUwgcXVlcnkuXG4gICAgICogQHJldHVybnMgQSByZXNwb3NlIG9iamVjdCBcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZGV0YWlscy5wYXNzd29yZCA9IHRoaXMuQVBJLmhhc2goZGV0YWlscy5wYXNzd29yZCk7XG4gICAgICogXG4gICAgICogY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuQVBJLmNyZWF0ZSh7XG4gICAgICogICB0YWJsZXM6ICdhZG1pbicsXG4gICAgICogICB2YWx1ZXM6IHtcbiAgICAgKiAgICAnZW1haWwnOnRoaXMuQVBJLmNvcmVGb3JtWydlbWFpbCddLFxuICAgICAqICAgICdwYXNzd29yZCc6IHRoaXMuQVBJLmNvcmVGb3JtWydwYXNzd29yZCddLCBcbiAgICAgKiAgfSxcbiAgICAgKiB9KTtcbiAgICAgKiBcbiAgICAgKiBpZihkYXRhLnN1Y2Nlc3Mpe1xuICAgICAqICBjb25zb2xlLmxvZyhkYXRhLm91dHB1dCk7XG4gICAgICogfVxuICAgICAqIFxuICAgKiovXG4gIGFzeW5jIGNyZWF0ZShwb3N0T2JqZWN0OkNvcmVDcmVhdGVPYmplY3QpOlByb21pc2U8Q29yZVJlc3BvbnNlPntcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgcmV0dXJuICBhd2FpdCB0aGlzLnBvc3QoJ2NyZWF0ZV9lbnRyeScsIHtcbiAgICAgICdkYXRhJzogSlNPTi5zdHJpbmdpZnkocG9zdE9iamVjdCksXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgICAqIFJ1bnMgYW4gcmVhZCBxdWVyeSB0byB0aGUgc2VydmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHBvc3RPYmplY3QgLSBBbiBvYmplY3QgY29udGFpbmluZyBzZWxlY3RvcnMsIHRhYmxlcywgYW5kIGNvbmRpdGlvbnMgZm9yIHRoZSBTUUwgcXVlcnkuXG4gICAgICogQHJldHVybnMgQSByZXNwb3NlIG9iamVjdCBcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuQVBJLnJlYWQoe1xuICAgICAqICAgc2VsZWN0b3JzOiBbXG4gICAgICogICAgICdmX2FkbWluLklEJyxcbiAgICAgKiAgICAgJ1VzZXJuYW1lJyxcbiAgICAgKiAgICAgJ0VtYWlsJyxcbiAgICAgKiAgICAgJ0NPVU5UKGZfbWVzc2FnZXMuSUQpIGFzIGluYm94J1xuICAgICAqICAgXSxcbiAgICAgKiAgIHRhYmxlczogJ2ZfYWRtaW4nLFxuICAgICAqICAgY29uZGl0aW9uczogYFdIRVJFIGVtYWlsID0gJHt0aGlzLkFQSS5jb3JlRm9ybVsnZW1haWwnXX1gXG4gICAgICogfSk7XG4gICAgICogXG4gICAgICogaWYoZGF0YS5zdWNjZXNzICYmIGRhdGEub3V0cHV0Lmxlbmd0aCA+IDApe1xuICAgICAqIC8vIHNpbmdsZSBvdXRwdXRcbiAgICAgKiAgY29uc29sZS5sb2coZGF0YS5vdXRwdXRbMF0pO1xuICAgICAqIC8vIGFsbCBvdXR0cHV0XG4gICAgICogIGZvcihsZXQgcm93IG9mIGRhdGEub3V0cHV0KXtcbiAgICAgKiAgICBjb25zb2xlLmxvZyhyb3cpO1xuICAgICAqICB9XG4gICAgICogfVxuICAgICAqIFxuICAgKiovXG4gIGFzeW5jIHJlYWQocG9zdE9iamVjdDpDb3JlUmVhZE9iamVjdCk6UHJvbWlzZTxDb3JlUmVzcG9uc2U+e1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5wb3N0KCdnZXRfZW50cmllcycsIHtcbiAgICAgICdkYXRhJzogSlNPTi5zdHJpbmdpZnkocG9zdE9iamVjdCksXG4gICAgfSlcbiAgfVxuICAgLyoqXG4gICAgICogUnVucyBhbiB1cGRhdGUgcXVlcnkgdG8gdGhlIHNlcnZlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwb3N0T2JqZWN0IC0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgc2VsZWN0b3JzLCB2YWx1ZXMgLHRhYmxlcywgYW5kIGNvbmRpdGlvbnMgZm9yIHRoZSBTUUwgcXVlcnkuXG4gICAgICogQHJldHVybnMgQSByZXNwb3NlIG9iamVjdCBcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZW5jcnlwdGVkID0gdGhpcy5BUEkuaGFzaCh0aGlzLkFQSS5jb3JlRm9ybVsncGFzc3dvcmQnXSk7XG4gICAgICogXG4gICAgICogY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuQVBJLnVwZGF0ZSh7XG4gICAgICogICB0YWJsZXM6ICdmX2FkbWluJyxcbiAgICAgKiAgIHZhbHVlczoge1xuICAgICAqICAgICdlbWFpbCc6dGhpcy5BUEkuY29yZUZvcm1bJ2VtYWlsJ10sXG4gICAgICogICAgJ3Bhc3N3b3JkJzogZW5jcnlwdGVkLCBcbiAgICAgKiAgIH0sXG4gICAgICogICBjb25kaXRpb25zOiBgV0hFUkUgZW1haWwgPSAke3RoaXMuQVBJLmNvcmVGb3JtWydlbWFpbCddfWBcbiAgICAgKiB9KTtcbiAgICAgKiBcbiAgICAgKiBpZihkYXRhLnN1Y2Nlc3Mpe1xuICAgICAqICAgY29uc29sZS5sb2coZGF0YS5vdXRwdXQpO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICoqL1xuICBhc3luYyB1cGRhdGUocG9zdE9iamVjdDpDb3JlVXBkYXRlT2JqZWN0KTpQcm9taXNlPENvcmVSZXNwb25zZT57XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgcmV0dXJuIGF3YWl0IHRoaXMucG9zdCgndXBkYXRlX2VudHJ5Jywge1xuICAgICdkYXRhJzogSlNPTi5zdHJpbmdpZnkocG9zdE9iamVjdCksXG4gIH0pXG4gIH1cblxuICAvKipcbiAgICAgKiBSdW5zIGFuIGRlbGV0ZSBxdWVyeSB0byB0aGUgc2VydmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHBvc3RPYmplY3QgLSBBbiBvYmplY3QgY29udGFpbmluZyB0YWJsZXMsIGFuZCBjb25kaXRpb25zIGZvciB0aGUgU1FMIHF1ZXJ5LlxuICAgICAqIEByZXR1cm5zIEEgcmVzcG9zZSBvYmplY3QgXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLkFQSS5kZWxldGUoe1xuICAgICAqICAgdGFibGVzOiAnZl9hZG1pbicsXG4gICAgICogICBjb25kaXRpb25zOiBgV0hFUkUgZW1haWwgPSAke3RoaXMuQVBJLmNvcmVGb3JtWydlbWFpbCddfWBcbiAgICAgKiB9KTtcbiAgICAgKiBcbiAgICAgKiBpZihkYXRhLnN1Y2Nlc3Mpe1xuICAgICAqICAgY29uc29sZS5sb2coZGF0YS5vdXRwdXQpO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICoqL1xuICBhc3luYyBkZWxldGUocG9zdE9iamVjdDpDb3JlRGVsZXRlT2JqZWN0KTpQcm9taXNlPENvcmVSZXNwb25zZT57XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCB0aGlzLnBvc3QoJ2RlbGV0ZV9lbnRyeScsIHtcbiAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHBvc3RPYmplY3QpLFxuICAgIH0pXG4gIH1cblxuICAvLyBGSUxFIEhBTkRMRVJTXG5cbiAgIC8qKlxuICAgICAqIEdldCBjb21wbGV0ZSBmaWxlIFVSTCBmcm9tIHRoZSBzZXJ2ZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSBmaWxlIC0gQSBzdHJpbmcgdGhhdCBwb2ludHMgdG8gdGhlIGZpbGUuXG4gICAgICogQHJldHVybnMgQSBjb21wbGV0ZSB1cmwgc3RyaW5nIGZyb20gdGhlIHNlcnZlciBcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgdXJsID0gdGhpcy5BUEkuZ2V0RmlsZVVSTCgnZmlsZXMvcHJvZmlsZS5wbmcnKTtcbiAgICAgKiBcbiAgICAgKiBPVVRQVVQ6XG4gICAgICogIGh0dHBzOi8vbG9jYWxob3N0OjgwODAvZmlsZXMvcHJvZmlsZS5wbmdcbiAgICAgKiBcbiAgICoqL1xuICBnZXRGaWxlVVJMKGZpbGU6IHN0cmluZyk6c3RyaW5nfHVuZGVmaW5lZCB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KFwiUGxlYXNlIGluaXRpYWxpemUgdXN3YWdvbiBjb3JlIG9uIHJvb3QgYXBwLmNvbXBvbmVudC50c1wiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGZpbGUpIHtcbiAgICAgIGlmIChmaWxlLmluY2x1ZGVzKCdodHRwOi8vJykgfHwgZmlsZS5pbmNsdWRlcygnaHR0cHM6Ly8nKSkgcmV0dXJuIGZpbGU7XG4gICAgICByZXR1cm4gdGhpcy5jb25maWc/LnNlcnZlciArIGAvJHt0aGlzLmNvbmZpZy5hcHB9L2AgKyBmaWxlIDtcbiAgICB9XG4gICAgcmV0dXJuIGZpbGU7XG4gIH1cblxuICAgLyoqXG4gICAgICogVXBsb2FkcyBhIGZpbGUgdG8gdGhlIHNlcnZlclxuICAgICAqXG4gICAgICogQHBhcmFtIGZpbGUgLSBBIEZpbGUgdG8gdXBsb2FkXG4gICAgICogQHBhcmFtIGZpbGVuYW1lIC0gQSBzdHJpbmcgdGhhdCBwb2ludHMgdG8gd2hlcmUgdGhlIGZpbGUgdG8gYmUgc3RvcmVkIGluIHRoZSBzZXJ2ZXJcbiAgICAgKiBAcGFyYW0gY2h1bmtTaXplIC0gQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBudW1iZXIgb2YgYnl0ZXMgdG8gdXBsb2FkIHBlciBjaHVua1xuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBcbiAgICAgKiBnZXRVcGxvYWRQcm9ncmVzcygpe1xuICAgICAqICByZXR1cm4gdGhpcy5BUEkudXBsb2FkUHJvZ3Jlc3NcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogYXdhaXQgdGhpcy5BUEkudXBsb2FkRmlsZShzb21lZmlsZSwgJ2ZpbGVzL3Byb2ZpbGUucG5nJyk7XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqIDxkaXY+e3tnZXRVcGxvYWRQcm9ncmVzcygpfX08ZGl2PiAvLyBkeW5hbWljYWxseSB1cGRhdGVzIHRoZSBwcm9ncmVzc1xuICAgKiovXG4gIHVwbG9hZEZpbGUoZmlsZTogRmlsZSwgZmlsZW5hbWU6IHN0cmluZywgY2h1bmtTaXplOiBudW1iZXIgPSAxMDI0ICogMTAyNCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydChcIlBsZWFzZSBpbml0aWFsaXplIHVzd2Fnb24gY29yZSBvbiByb290IGFwcC5jb21wb25lbnQudHNcIik7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKCk9PntyZXR1cm4gbnVsbH0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdG90YWxDaHVua3MgPSBNYXRoLmNlaWwoZmlsZS5zaXplIC8gY2h1bmtTaXplKTtcbiAgICAgIGxldCB1cGxvYWRlZENodW5rcyA9IDA7IC8vIFRyYWNrIHVwbG9hZGVkIGNodW5rc1xuXG4gICAgICBjb25zdCB1cGxvYWRDaHVuayA9IChjaHVua0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBjaHVua0luZGV4ICogY2h1bmtTaXplO1xuICAgICAgICBjb25zdCBlbmQgPSBNYXRoLm1pbihzdGFydCArIGNodW5rU2l6ZSwgZmlsZS5zaXplKTtcbiAgICAgICAgY29uc3QgY2h1bmsgPSBmaWxlLnNsaWNlKHN0YXJ0LCBlbmQpO1xuXG4gICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIHJlYWRlci5vbmxvYWRlbmQgPSAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgYmFzZTY0U3RyaW5nID0gKHJlYWRlci5yZXN1bHQgYXMgc3RyaW5nKS5zcGxpdCgnLCcpWzFdO1xuXG4gICAgICAgICAgY29uc3QgJHN1YiA9IHRoaXMuaHR0cFxuICAgICAgICAgICAgLnBvc3QodGhpcy5jb25maWc/Lm5vZGVzZXJ2ZXIgKyAnL2ZpbGVoYW5kbGVyLXByb2dyZXNzJywge1xuICAgICAgICAgICAgICBrZXk6IHRoaXMuY29uZmlnPy5hcGlLZXksXG4gICAgICAgICAgICAgIGFwcDogdGhpcy5jb25maWc/LmFwcCxcbiAgICAgICAgICAgICAgbWV0aG9kOiAnY3JlYXRlX3VybCcsXG4gICAgICAgICAgICAgIGNodW5rOiBiYXNlNjRTdHJpbmcsXG4gICAgICAgICAgICAgIGZpbGVOYW1lOiAgZmlsZW5hbWUsXG4gICAgICAgICAgICAgIGNodW5rSW5kZXg6IGNodW5rSW5kZXgsXG4gICAgICAgICAgICAgIHRvdGFsQ2h1bmtzOiB0b3RhbENodW5rcyxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICAgbmV4dDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHVwbG9hZGVkQ2h1bmtzKys7XG4gICAgICAgICAgICAgICAgdGhpcy51cGxvYWRQcm9ncmVzcyA9IE1hdGgucm91bmQoKHVwbG9hZGVkQ2h1bmtzIC8gdG90YWxDaHVua3MpICogMTAwKTtcbiAgICAgICAgICAgICAgICBpZiAoY2h1bmtJbmRleCArIDEgPCB0b3RhbENodW5rcykge1xuICAgICAgICAgICAgICAgICAgLy8gVXBsb2FkIG5leHQgY2h1bmtcbiAgICAgICAgICAgICAgICAgIHVwbG9hZENodW5rKGNodW5rSW5kZXggKyAxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYEZpbGUgdXBsb2FkIGNvbXBsZXRlOiAke2ZpbGVuYW1lfWApO1xuICAgICAgICAgICAgICAgICAgdGhpcy51cGxvYWRQcm9ncmVzcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICRzdWIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTsgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSB3aGVuIHRoZSB1cGxvYWQgaXMgY29tcGxldGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGVycm9yOiAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgJHN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwbG9hZGluZyBjaHVuaycsIGVycik7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7IC8vIFJlamVjdCB0aGUgcHJvbWlzZSBvbiBlcnJvclxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoY2h1bmspO1xuICAgICAgfTtcblxuICAgICAgLy8gU3RhcnQgdXBsb2FkaW5nIHRoZSBmaXJzdCBjaHVua1xuICAgICAgdXBsb2FkQ2h1bmsoMCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBkaXNwb3NlRmlsZShmaWxlbmFtZTogc3RyaW5nKXtcbiAgICAgIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMuaHR0cFxuICAgICAgLnBvc3QodGhpcy5jb25maWc/Lm5vZGVzZXJ2ZXIgKyAnL2ZpbGVoYW5kbGVyLXByb2dyZXNzJywge1xuICAgICAgICBrZXk6IHRoaXMuY29uZmlnPy5hcGlLZXksXG4gICAgICAgIGFwcDogdGhpcy5jb25maWc/LmFwcCxcbiAgICAgICAgbWV0aG9kOiAnZGVsZXRlX3VybCcsXG4gICAgICAgIGZpbGVOYW1lOiAgZmlsZW5hbWUsXG4gICAgICB9KSlcbiAgICAgIDtcbiAgfTtcbiAgXG59XG4iXX0=