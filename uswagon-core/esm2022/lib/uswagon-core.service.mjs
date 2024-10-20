import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "@angular/router";
export class UswagonCoreService {
    constructor(http, router) {
        this.http = http;
        this.router = router;
        this.loadingSubject = new BehaviorSubject(false);
        /**
          * Get loading status of the API
          *
          * @example
          * this.API.isLoading$.subscribe(loading => {
          *  this.loading = loading;
          * })
          *
        **/
        this.isLoading$ = this.loadingSubject.asObservable();
        this.coreFeedback = [];
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
        this.loaderDelay = 3000;
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
        if (this.config.loaderDelay != undefined) {
            this.loaderDelay = this.config.loaderDelay;
        }
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
        this.socket.send(JSON.stringify({ key: this.config?.apiKey, app: this.config?.app, data: data }));
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
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
        }
        if (!isLoading) {
            this.loadingTimeout = setTimeout(() => {
                this.loadingSubject.next(isLoading);
            }, this.loaderDelay);
        }
        else {
            this.loadingSubject.next(isLoading);
        }
    }
    /**
       * Creates a hash from the server for encrypting data
       *
       * @param type - a type of feedback message to send
       *
       * @param message - a string containing the message to send
       *
       * @param timer - a number representing the delay for the feedback to close
       *
       * @example
       *
       * this.API.sendFeedback('success', 'Pushed data!', 5000)
       *
     **/
    sendFeedback(type, message, timer) {
        if (this.coreFeedback.length > 3) {
            clearTimeout(this.coreFeedback[0].timeout);
            this.coreFeedback.shift();
        }
        const index = this.coreFeedback.length;
        this.coreFeedback.push({
            type: type,
            message: message,
            timeout: null,
        });
        if (timer != undefined) {
            // Set a timer to reset the snackbar feedback after 2 seconds
            this.coreFeedback[index].timeout = setTimeout(() => {
                // this.coreFeedback[index] = undefined;
                this.coreFeedback.splice(index, 1);
            }, timer);
        }
    }
    /**
       * Closes a feedback
       *
       * @param index - A number representing the index of feedback to close
       *
       * @example
       *
       * this.API.sendFeedback('success', 'Pushed data!')
       *
     **/
    closeFeedback(index) {
        clearTimeout(this.coreFeedback[index].timeout);
        this.coreFeedback.splice(index, 1);
    }
    /**
       * Store API feedback for snackbars and other display feedback
       *
       * @returns - A list of feedback objects with {type, message}
       *
       * @example
       *
       * getFeedbacks(){
       *   return this.API.getFeedbacks();
       * }
       *
       * OUTPUT:
       *  // Snackbars in app.component.ts (root)
       *  <div class='snackbar' *ngFor='let feedback of getFeedbacks()'> {{feedback.message}} </div>
       *
       *
     **/
    getFeedbacks() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1jb3JlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWNvcmUvc3JjL2xpYi91c3dhZ29uLWNvcmUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBYSxNQUFNLGVBQWUsQ0FBQztBQUd0RCxPQUFPLEVBQUcsZUFBZSxFQUFTLGNBQWMsRUFBRSxNQUFNLE1BQU0sQ0FBQzs7OztBQUsvRCxNQUFNLE9BQU8sa0JBQWtCO0lBNEM3QixZQUNVLElBQWdCLEVBQ2hCLE1BQWM7UUFEZCxTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ2hCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFuQ2hCLG1CQUFjLEdBQTZCLElBQUksZUFBZSxDQUFVLEtBQUssQ0FBQyxDQUFDO1FBQ3RGOzs7Ozs7OztXQVFHO1FBQ0csZUFBVSxHQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFaEQsaUJBQVksR0FBMEIsRUFBRSxDQUFDO1FBQ3pDLGVBQVUsR0FBWSxFQUFFLENBQUE7UUFDL0I7Ozs7Ozs7Ozs7O1dBV0c7UUFDRyxhQUFRLEdBQVksRUFBRSxDQUFBO1FBSXJCLGVBQVUsR0FBcUQsRUFBRSxDQUFDO1FBQ2xFLGdCQUFXLEdBQVUsSUFBSSxDQUFDO0lBSzlCLENBQUM7SUFFTCxpQkFBaUI7SUFDakI7Ozs7Ozs7Ozs7Ozs7UUFhSTtJQUNKLFVBQVUsQ0FBQyxNQUFpQjtRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxJQUFJLFNBQVMsRUFBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDN0MsQ0FB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Q0FBQyxNQUFNLEVBQUUsTUFBTTtZQUN4QixHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHO1lBQ3JCLE1BQU0sRUFBRSxZQUFZO1lBQ3BCLFFBQVEsRUFBRyxRQUFRO1NBQ3BCLENBQUMsQ0FBQyxDQUNGO0lBQ0wsQ0FBQztJQUFBLENBQUM7K0dBN3RCUyxrQkFBa0I7bUhBQWxCLGtCQUFrQixjQUZqQixNQUFNOzs0RkFFUCxrQkFBa0I7a0JBSDlCLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cENsaWVudCwgSHR0cEhlYWRlcnMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBJbmplY3RhYmxlLCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBDb3JlQ29uZmlnLCBDb3JlQ3JlYXRlT2JqZWN0LCBDb3JlRGVsZXRlT2JqZWN0LCBDb3JlRm9ybSwgQ29yZVJlYWRPYmplY3QsIENvcmVSZXNwb25zZSwgQ29yZVVwZGF0ZU9iamVjdCwgU25hY2tiYXJDb3JlRmVlZGJhY2sgfSBmcm9tICcuL3R5cGVzL3Vzd2Fnb24tY29yZS50eXBlcyc7XG5pbXBvcnQgeyAgQmVoYXZpb3JTdWJqZWN0LCBmaXJzdCwgZmlyc3RWYWx1ZUZyb20gfSBmcm9tICdyeGpzJztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgVXN3YWdvbkNvcmVTZXJ2aWNlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgIC8qKlxuICAgICAqIFVwbG9hZCBwcm9ncmVzcyBpbmRpY2F0b3Igb24gY3VycmVudCBmaWxlIHVwbG9hZFxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogZ2V0VXBsb2FkUHJvZ3Jlc3MoKXtcbiAgICAgKiAgcmV0dXJuIHRoaXMuQVBJLnVwbG9hZFByb2dyZXNzO1xuICAgICAqIH1cbiAgICAgKiAgXG4gICAqKi9cbiAgcHVibGljIHVwbG9hZFByb2dyZXNzPzpudW1iZXI7XG4gIHByaXZhdGUgbG9hZGluZ1N1YmplY3Q6IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPiA9IG5ldyBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4oZmFsc2UpO1xuICAgLyoqXG4gICAgICogR2V0IGxvYWRpbmcgc3RhdHVzIG9mIHRoZSBBUElcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLmlzTG9hZGluZyQuc3Vic2NyaWJlKGxvYWRpbmcgPT4ge1xuICAgICAqICB0aGlzLmxvYWRpbmcgPSBsb2FkaW5nO1xuICAgICAqIH0pXG4gICAgICogIFxuICAgKiovXG4gIHB1YmxpYyBpc0xvYWRpbmckID0gIHRoaXMubG9hZGluZ1N1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG5cbiAgcHJpdmF0ZSBjb3JlRmVlZGJhY2s6U25hY2tiYXJDb3JlRmVlZGJhY2tbXSA9IFtdO1xuICBwcml2YXRlIHB1YmxpY0Zvcm06Q29yZUZvcm0gPSB7fVxuICAgLyoqXG4gICAgICogU2VjdXJlIGZvcm0gZm9yIHN0b3JpbmcgbW9yZSBzZWN1cmUgaW5wdXRcbiAgICAgKiBcbiAgICAgKiBOT1RFOiBUaGlzIGlzIHRoZSBmb3JtIHRoYXQgc2hvdWxkIGJlIHVzZWQgd2hlbiBidWlsZGluZyBwb3N0T2JqZWN0c1xuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogZm9yKGxldCBrZXkgaW4gdGhpcy5BUEkuY29yZUZvcm0pe1xuICAgICAqICAvLyBwcm9jZXNzIHZhbHVlXG4gICAgICogIGNvbnNvbGUubG9nKHRoaXMuQVBJLmNvcmVGb3JtW2tleV0pO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICoqL1xuICBwdWJsaWMgY29yZUZvcm06Q29yZUZvcm0gPSB7fVxuICBwcml2YXRlIHNvY2tldD86IFdlYlNvY2tldDtcbiAgcHJpdmF0ZSBjb25maWc/OiBDb3JlQ29uZmlnO1xuICBwcml2YXRlIHRpbWVvdXQ6YW55O1xuICBwcml2YXRlIGxpdmVFdmVudHM6e1trZXk6IHN0cmluZ106IChtZXNzYWdlOiBNZXNzYWdlRXZlbnQpID0+IHZvaWQgfSA9IHt9O1xuICBwcml2YXRlIGxvYWRlckRlbGF5Om51bWJlciA9IDMwMDA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXG4gICkgeyB9XG5cbiAgLy8gSU5JVElBTElaQVRJT05cbiAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIHNlcnZpY2UgZm9yIHRoZSBwcm9qZWN0XG4gICAgICogQHBhcmFtIGNvbmZpZyAtIGNvbmZpZ3VyYXRpb24gdGhhdCBwb2ludHMgdGhlIHNlcnZpY2UgdG8gaXRzIGFwcHJvcHJpYXRlIHNlcnZlclxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogdGhpcy5BUEkuaW5pdGlhbGl6ZSh7XG4gICAgICogIGFwaTplbnZpcm9ubWVudC5hcGksXG4gICAgICogIGFwaUtleTogZW52aXJvbm1lbnQuYXBpS2V5LFxuICAgICAqICBub2Rlc2VydmVyOiBlbnZpcm9ubWVudC5ub2Rlc2VydmVyLFxuICAgICAqICBzZXJ2ZXI6IGVudmlyb25tZW50LnNlcnZlcixcbiAgICAgKiAgc29ja2V0OiBlbnZpcm9ubWVudC5zb2NrZXRcbiAgICAgKiB9KVxuICAgICAqIFxuICAgKiovXG4gIGluaXRpYWxpemUoY29uZmlnOkNvcmVDb25maWcpe1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIGlmKHRoaXMuY29uZmlnLmxvYWRlckRlbGF5ICE9IHVuZGVmaW5lZCl7XG4gICAgICB0aGlzLmxvYWRlckRlbGF5ID0gdGhpcy5jb25maWcubG9hZGVyRGVsYXk7XG4gICAgfVxuICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldChjb25maWcuc29ja2V0KTtcbiAgICB0aGlzLnNvY2tldC5iaW5hcnlUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgICB0aGlzLnNvY2tldCEub25tZXNzYWdlID0gKG1lc3NhZ2UpPT57XG4gICAgICB2YXIgZGVjb2RlZE1lc3NhZ2UgPSBuZXcgVGV4dERlY29kZXIoJ3V0Zi04JykuZGVjb2RlKG1lc3NhZ2UuZGF0YSk7XG4gICAgICBjb25zdCBzb2NrZXREYXRhID0gSlNPTi5wYXJzZShkZWNvZGVkTWVzc2FnZSk7XG4gICAgICBpZihzb2NrZXREYXRhLmFwcCAhPSBjb25maWcuYXBwKSByZXR1cm47XG4gICAgICBmb3IgKGNvbnN0IGlkIGluIHRoaXMubGl2ZUV2ZW50cykge1xuICAgICAgICAgIHRoaXMubGl2ZUV2ZW50c1tpZF0oc29ja2V0RGF0YS5kYXRhKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAgLyoqXG4gICAgICogQWRkIGEgbmV3IGxpdmUgbGlzdGVuZXIgZnJvbSB0aGUgc2VydmVyJ3Mgd2Vic29ja2V0XG4gICAgICogXG4gICAgICogQHBhcmFtIGlkIC0gVW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoZSBsaXN0ZW5lcnMgdG8gYXZvaWQgY29sbGlzaW9uc1xuICAgICAqIEBwYXJhbSBoYW5kbGVyIC0gV2Vic29ja2V0IG1lc3NhZ2VzIGFyZSBwYXNzZWQgdG8gdGhpcyBoYW5kbGVyXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLmFkZExpdmVMaXN0ZW5lcignZXZlbnQtMScsKG1lc3NhZ2UpPT57XG4gICAgICogIE9VVFBVVDpcbiAgICAgKiAgLy8gc2FtZSBhcyB0aGUganNvbiBzZW50IGZyb20gc29ja2V0U2VuZChkYXRhKVxuICAgICAqICAvLyBsb2dpY3MgYXJlIGFwcGxpZWQgaGVyZSBzbyB0aGF0IG1lc3NhZ2VzIGFyZSBvbmx5IHJlY2VpdmVkIG9uIHNwZWNpZmljIGNsaWVudHNcbiAgICAgKiAgY29uc29sZS5sb2cobWVzc2FnZSk7XG4gICAgICogfSlcbiAgICAgKiBcbiAgICAgKiBcbiAgICoqL1xuICBhZGRTb2NrZXRMaXN0ZW5lciggaWQ6c3RyaW5nLGhhbmRsZXI6KG1lc3NhZ2U6IGFueSk9PnZvaWQpIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgdGhpcy5saXZlRXZlbnRzW2lkXT0gaGFuZGxlcjtcbiAgfVxuICAvKipcbiAgICAgKiBHZXQgbGlzdCBvZiBsaXZlIGxpc3RlbmVycyBpbiB0aGUgcHJvamVjdFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0aGlzLkFQSS5nZXRMaXN0ZW5lcnMoKTtcbiAgICAgKiBcbiAgICAgKiBPVVRQVVQ6IEFuIGFsZXJ0IHNob3dpbmcgbGlzdCBvZiBsaXN0ZW5lcnNcbiAgICAgKiBcbiAgICAgKiBcbiAgICoqL1xuICBnZXRMaXN0ZW5lcnMoKSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIGFsZXJ0KEpTT04uc3RyaW5naWZ5KE9iamVjdC5rZXlzKHRoaXMubGl2ZUV2ZW50cykpKTtcbiAgfVxuICAvKipcbiAgICAgKiBTZW5kcyBhIG1lc3NhZ2UgdG8gdGhlIHdlYnNvY2tldFxuICAgICAqIEBwYXJhbSBkYXRhIC0gQSBqc29uIG9iamVjdCBtZXNzYWdlXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLnNvY2tldFNlbmQoe1xuICAgICAqICAgIHRvOiBzdHVkZW50LmlkLFxuICAgICAqICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICogfSlcbiAgICAgKiBcbiAgICAgKiBcbiAgICoqL1xuICBzb2NrZXRTZW5kKGRhdGE6IG9iamVjdCkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgIFxuICAgIHRoaXMuc29ja2V0IS5zZW5kKFxuICAgICAgSlNPTi5zdHJpbmdpZnkoeyBrZXk6IHRoaXMuY29uZmlnPy5hcGlLZXksIGFwcDogdGhpcy5jb25maWc/LmFwcCwgZGF0YTogZGF0YSB9KVxuICAgICk7XG4gIFxuICB9XG4gIFxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLnNvY2tldD8uY2xvc2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgcGdFc2NhcGVTdHJpbmcoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW5wdXQgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgIH0gXG4gICAgLy8gRXNjYXBlIHNpbmdsZSBxdW90ZXMgYnkgcmVwbGFjaW5nIHRoZW0gd2l0aCB0d28gc2luZ2xlIHF1b3Rlc1xuICAgIHJldHVybiBpbnB1dC5yZXBsYWNlKC8nL2csIFwiJydcIikudHJpbSgpO1xuICB9XG5cbiAgLyoqXG4gICAgICogQnVpbGRzIGEgQ29yZUZvcm0gZnJvbSB1c2VyIGlucHV0XG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5IC0gQSBzdHJpbmcgcmVmZXJlbmNlIHRvIGZvcm0ga2V5XG4gICAgICogQHBhcmFtIHZhbHVlIC0gQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiBhIGZvcm0ga2V5XG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBcbiAgICAgKiBoYW5kbGVJbnB1dChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyl7XG4gICAgICogIHRoaXMuQVBJLmhhbmRsZUZvcm1WYWx1ZSgnZW1haWwnLCBldmVudC50YXJnZXQudmFsdWUpOyAvLyBrZXkgc2hvdWxkIGJlIGluaXRpYWxpemVkIHVzaW5nIGluaXRpYWxpemVGb3JtKClcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqIDxpbnB1dCAoY2hhbmdlKT0naGFuZGxlSW5wdXQoXCJlbWFpbFwiLCAkZXZlbnQpJyA+IFxuICAgICAqXG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgaGFuZGxlRm9ybVZhbHVlKGtleTpzdHJpbmcsIHZhbHVlOnN0cmluZyl7XG4gICAgdGhpcy5wdWJsaWNGb3JtW2tleV0gPSB2YWx1ZTsgXG4gICAgdGhpcy5jb3JlRm9ybVtrZXldID0gdGhpcy5wZ0VzY2FwZVN0cmluZyh2YWx1ZSk7XG4gIH1cbiAgIC8qKlxuICAgICAqIEJ1aWxkcyBhIENvcmVGb3JtIGZyb20gdXNlciBpbnB1dFxuICAgICAqXG4gICAgICogQHBhcmFtIGtleSAtIEEgc3RyaW5nIHJlZmVyZW5jZSB0byBmb3JtIGtleVxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogXG4gICAgICogZ2V0SW5wdXQoa2V5OnN0cmluZyl7XG4gICAgICogIHJldHVybiB0aGlzLkFQSS5nZXRGb3JtVmFsdWUoa2V5KTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqIDxkaXY+e3tnZXRJbnB1dCgnZW1haWwnKX19PC9kaXY+XG4gICAgICogXG4gICAqKi9cbiAgIGdldEZvcm1WYWx1ZShrZXk6c3RyaW5nKXtcbiAgICBpZih0aGlzLnB1YmxpY0Zvcm1ba2V5XSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdQbGVhc2UgaW5pdGlhbGl6ZSB0aGUgZm9ybSB1c2luZyBpbml0aWFsaXplRm9ybShbLi4uZmllbGRzXSknKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHVibGljRm9ybVtrZXldO1xuICB9XG5cbiAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBhIENvcmVGb3JtXG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5cyAtIEEgbGlzdCBvZiBzdHJpbmdzIHJlcHJlc2VudGluZyBmb3JtIGtleXNcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLmluaXRpYWxpemVGb3JtKFsnZW1haWwnXSk7XG4gICAgICogIFxuICAgICAqIE9VVFBVVDpcbiAgICAgKiBjb25zb2xlLmxvZyh0aGlzLkFQSS5jb3JlRm9ybSk7IFxuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIGluaXRpYWxpemVGb3JtKGtleXM6c3RyaW5nW10pe1xuICAgIHRoaXMucHVibGljRm9ybSA9IGtleXMucmVkdWNlKChwcmV2OmFueSxjdXJyOmFueSk9PntcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHByZXYsIHtbY3Vycl06Jyd9KVxuICAgIH0se30pXG4gICAgdGhpcy5jb3JlRm9ybSA9IGtleXMucmVkdWNlKChwcmV2OmFueSxjdXJyOmFueSk9PntcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHByZXYsIHtbY3Vycl06Jyd9KVxuICAgIH0se30pXG4gIH1cblxuICAvLyBVVElMSVRJRVNcbiAgcHJpdmF0ZSBsb2FkaW5nVGltZW91dDphbnk7XG4gIC8qKlxuICAgICAqIE1hcmsgdGhlIHN0YXR1cyBvZiB0aGUgQVBJIGFzIGxvYWRpbmdcbiAgICAgKlxuICAgICAqIEBwYXJhbSBpc0xvYWRpbmcgLSBBIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBBUEkgaXMgbG9hZGluZ1xuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogXG4gICAgICogdGhpcy5BUEkuc2V0TG9hZGluZyh0cnVlKVxuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKHRoaXMuQVBJLmlzTG9hZGluZyk7XG4gICAgICogXG4gICAqKi9cbiAgc2V0TG9hZGluZyhpc0xvYWRpbmc6Ym9vbGVhbil7XG4gICAgaWYodGhpcy5sb2FkaW5nVGltZW91dCl7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5sb2FkaW5nVGltZW91dCk7XG4gICAgfVxuICAgIGlmKCFpc0xvYWRpbmcpe1xuICAgICAgdGhpcy5sb2FkaW5nVGltZW91dCA9ICBzZXRUaW1lb3V0KCgpPT57XG4gICAgICAgIHRoaXMubG9hZGluZ1N1YmplY3QubmV4dChpc0xvYWRpbmcpO1xuICAgICAgfSwgdGhpcy5sb2FkZXJEZWxheSlcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMubG9hZGluZ1N1YmplY3QubmV4dChpc0xvYWRpbmcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgICAqIENyZWF0ZXMgYSBoYXNoIGZyb20gdGhlIHNlcnZlciBmb3IgZW5jcnlwdGluZyBkYXRhXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdHlwZSAtIGEgdHlwZSBvZiBmZWVkYmFjayBtZXNzYWdlIHRvIHNlbmRcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gbWVzc2FnZSAtIGEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIG1lc3NhZ2UgdG8gc2VuZFxuICAgICAqIFxuICAgICAqIEBwYXJhbSB0aW1lciAtIGEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgZGVsYXkgZm9yIHRoZSBmZWVkYmFjayB0byBjbG9zZVxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogXG4gICAgICogdGhpcy5BUEkuc2VuZEZlZWRiYWNrKCdzdWNjZXNzJywgJ1B1c2hlZCBkYXRhIScsIDUwMDApXG4gICAgICogXG4gICAqKi9cbiAgICBzZW5kRmVlZGJhY2sodHlwZTonc3VjY2Vzcyd8J2Vycm9yJ3wnbmV1dHJhbCd8J3dhcm5pbmcnLG1lc3NhZ2U6c3RyaW5nLCB0aW1lcj86bnVtYmVyKXtcbiAgICAgIGlmKHRoaXMuY29yZUZlZWRiYWNrLmxlbmd0aCA+IDMpe1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5jb3JlRmVlZGJhY2tbMF0udGltZW91dCk7XG4gICAgICAgIHRoaXMuY29yZUZlZWRiYWNrLnNoaWZ0KCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5jb3JlRmVlZGJhY2subGVuZ3RoO1xuICAgICAgdGhpcy5jb3JlRmVlZGJhY2sucHVzaCh7XG4gICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICAgIHRpbWVvdXQ6bnVsbCxcbiAgICAgIH0pXG4gICAgICBcbiAgICAgIGlmICh0aW1lciAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gU2V0IGEgdGltZXIgdG8gcmVzZXQgdGhlIHNuYWNrYmFyIGZlZWRiYWNrIGFmdGVyIDIgc2Vjb25kc1xuICAgICAgICB0aGlzLmNvcmVGZWVkYmFja1tpbmRleF0udGltZW91dCA9ICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAvLyB0aGlzLmNvcmVGZWVkYmFja1tpbmRleF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgdGhpcy5jb3JlRmVlZGJhY2suc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfSwgdGltZXIpO1xuICAgICAgfVxuICAgIH1cbiAgLyoqXG4gICAgICogQ2xvc2VzIGEgZmVlZGJhY2tcbiAgICAgKlxuICAgICAqIEBwYXJhbSBpbmRleCAtIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgaW5kZXggb2YgZmVlZGJhY2sgdG8gY2xvc2VcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFxuICAgICAqIHRoaXMuQVBJLnNlbmRGZWVkYmFjaygnc3VjY2VzcycsICdQdXNoZWQgZGF0YSEnKVxuICAgICAqIFxuICAgKiovXG4gIGNsb3NlRmVlZGJhY2soaW5kZXg6bnVtYmVyKXtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5jb3JlRmVlZGJhY2tbaW5kZXhdLnRpbWVvdXQpO1xuICAgIHRoaXMuY29yZUZlZWRiYWNrLnNwbGljZShpbmRleCwgMSk7XG4gIH1cbiAgLyoqXG4gICAgICogU3RvcmUgQVBJIGZlZWRiYWNrIGZvciBzbmFja2JhcnMgYW5kIG90aGVyIGRpc3BsYXkgZmVlZGJhY2tcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyAtIEEgbGlzdCBvZiBmZWVkYmFjayBvYmplY3RzIHdpdGgge3R5cGUsIG1lc3NhZ2V9XG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBcbiAgICAgKiBnZXRGZWVkYmFja3MoKXtcbiAgICAgKiAgIHJldHVybiB0aGlzLkFQSS5nZXRGZWVkYmFja3MoKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqICAvLyBTbmFja2JhcnMgaW4gYXBwLmNvbXBvbmVudC50cyAocm9vdClcbiAgICAgKiAgPGRpdiBjbGFzcz0nc25hY2tiYXInICpuZ0Zvcj0nbGV0IGZlZWRiYWNrIG9mIGdldEZlZWRiYWNrcygpJz4ge3tmZWVkYmFjay5tZXNzYWdlfX0gPC9kaXY+XG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgICBnZXRGZWVkYmFja3MoKXtcbiAgICAgIHJldHVybiB0aGlzLmNvcmVGZWVkYmFjaztcbiAgICB9XG4gICAvKipcbiAgICAgKiBDcmVhdGVzIGEgaGFzaCBmcm9tIHRoZSBzZXJ2ZXIgZm9yIG5vbiBkZWNyeXB0YWJsZSBkYXRhXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGV4dCAtIEEgc3RyaW5nIHRvIGVuY3J5cHRcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBBIHN0cmluZyBoYXNoIG9yIHRocm93cyBhbiBlcnJvciBpZiBhbiBlcnJvciBoYXMgb2NjdXJlZFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBoYXNoID0gdGhpcy5BUEkuaGFzaCgna2VuJyk7XG4gICAgICogXG4gICAgICogY29uc29sZS5sb2coaGFzaCk7XG4gICAgICogXG4gICAqKi9cbiAgYXN5bmMgaGFzaCh0ZXh0OnN0cmluZyl7XG4gICAgY29uc3QgcmVzcG9uc2UgPSAgYXdhaXQgdGhpcy5wb3N0KCdnZXRfaGFzaCcsIHt0ZXh0OiB0ZXh0fSlcbiAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgIHJldHVybiByZXNwb25zZS5vdXRwdXQ7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlcnZlciBFcnJvcicpO1xuXG4gICAgfVxuICB9XG4gICAvKipcbiAgICAgKiBFbmNyeXB0cyBhIHRleHQgXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGV4dCAtIEEgc3RyaW5nIHRvIGVuY3J5cHRcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBBIHN0cmluZyBhbiBlbmNyeXB0ZWQgdGV4dCBvciB0aHJvd3MgYW4gZXJyb3IgaWYgYW4gZXJyb3IgaGFzIG9jY3VyZWRcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZW5jcnlwdGVkID0gdGhpcy5BUEkuZW5jcnlwdCgna2VuJyk7XG4gICAgICogXG4gICAgICogY29uc29sZS5sb2coZW5jcnlwdGVkKTtcbiAgICAgKiBcbiAgICoqL1xuICAgYXN5bmMgZW5jcnlwdCh0ZXh0OnN0cmluZyl7XG4gICAgY29uc3QgcmVzcG9uc2UgPSAgYXdhaXQgdGhpcy5wb3N0KCdlbmNyeXB0Jywge3RleHQ6IHRleHR9KVxuICAgIGlmKHJlc3BvbnNlLnN1Y2Nlc3Mpe1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm91dHB1dDtcbiAgICB9ZWxzZXtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2VydmVyIEVycm9yJyk7XG5cbiAgICB9XG4gIH1cbiAgIC8qKlxuICAgICAqIERlY3J5cHQgYW4gZW5jcnlwdGVkIHRleHQgaW4gdGhlIHNlcnZlciB0byBnZXQgcGxhaW4gdGV4dFxuICAgICAqXG4gICAgICogQHBhcmFtIGVuY3J5cHRlZCAtIEEgc3RyaW5nIHRvIGVuY3J5cHRcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBBIHN0cmluZyB0aGUgcGxhaW4gdGV4dCBvZiBhbiBlbmNyeXB0ZWQgdGV4dCBvciBvciB0aHJvd3MgYW4gZXJyb3IgaWYgYW4gZXJyb3IgaGFzIG9jY3VyZWRcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgcGxhaW5UZXh0ID0gdGhpcy5BUEkuZGVjcnlwdCgnQXNpMTJpVVNJRFVBSVNEVTEyJyk7XG4gICAgICogXG4gICAgICogY29uc29sZS5sb2cocGxhaW5UZXh0KTtcbiAgICAgKiBcbiAgICoqL1xuICAgYXN5bmMgZGVjcnlwdChlbmNyeXB0ZWQ6c3RyaW5nKXtcbiAgICBjb25zdCByZXNwb25zZSA9ICBhd2FpdCB0aGlzLnBvc3QoJ2RlY3J5cHQnLCB7ZW5jcnlwdGVkOiBlbmNyeXB0ZWR9KVxuICAgIGlmKHJlc3BvbnNlLnN1Y2Nlc3Mpe1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm91dHB1dDtcbiAgICB9ZWxzZXtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2VydmVyIEVycm9yJyk7XG4gICAgfVxuICB9XG4gICAvKipcbiAgICAgKiBDaGVja3MgaWYgYSB2YWx1ZSBtYXRjaGVzIGEgaGFzaFxuICAgICAqXG4gICAgICogQHBhcmFtIHRleHQgLSBBIHN0cmluZyB0byBjaGVja1xuICAgICAqIFxuICAgICAqIEBwYXJhbSBoYXNoIC0gQSBoYXNoIHN0cmluZyB0byBjaGVja1xuICAgICAqIFxuICAgICAqIEByZXR1cm5zIC0gVHJ1ZSBpZiB0ZXh0IGFuZCBoYXNoIG1hdGNoZXMsIGZhbHNlIG90aGVyd2lzZS4gVGhyb3dzIGFuIGVycm9yIGlmIGFuIGVycm9yIGhhcyBvY2N1cnJlZC5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgbWF0Y2ggPSB0aGlzLkFQSS52ZXJpZnlIYXNoKCd0ZXh0JywnJDJhYXNka2syLjEyM2kxMjNpamFzdWRma2xhanNkbGEnKTtcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyhtYXRjaCk7XG4gICAgICogXG4gICAqKi9cbiAgIGFzeW5jIHZlcmlmeUhhc2godGV4dDpzdHJpbmcsaGFzaDpzdHJpbmcpe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gIGF3YWl0IHRoaXMucG9zdCgndmVyaWZ5X2hhc2gnLCB7dGV4dDogdGV4dCwgaGFzaDpoYXNofSlcbiAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgIHJldHVybiByZXNwb25zZS5vdXRwdXQ7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlcnZlciBFcnJvcicpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICAgKiBDcmVhdGVzIGEgdW5pcXVlIGlkZW50aWZpZXIgd2l0aCB0aGUgbGVuZ3RoIG9mIDMyXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBIHJhbmRvbSB1bmlxdWUgMzIgc3RyaW5nIGlkZW50aWZpZXJcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgaWQgPSB0aGlzLkFQSS5jcmVhdGVVbmlxdWVJRDMyKCk7XG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgY3JlYXRlVW5pcXVlSUQzMigpIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgY29uc3QgdGltZXN0YW1wID0gRGF0ZS5ub3coKS50b1N0cmluZygxNik7IC8vIEdldCBjdXJyZW50IHRpbWUgaW4gaGV4XG4gICAgICBjb25zdCByYW5kb21QYXJ0ID0gJ3h4eHh4eHh4eHh4eHh4eHgnLnJlcGxhY2UoL3gvZywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIDE2IHwgMCkudG9TdHJpbmcoMTYpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGltZXN0YW1wICsgcmFuZG9tUGFydC5zbGljZSgwLCAxNik7IC8vIENvbWJpbmUgdGltZXN0YW1wIHdpdGggcmFuZG9tIHBhcnRcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZW5jcnlwdFJlcXVlc3QocGxhaW50ZXh0OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGtleVN0cmluZyA9ICdBSFM4NTc2NTk4UElPVU5BMjE0ODQyNzgwMzA5bXBxYkgnO1xuICAgIGNvbnN0IGtleSA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShrZXlTdHJpbmcuc2xpY2UoMCwgMzIpKTsgLy8gVXNlIG9ubHkgdGhlIGZpcnN0IDMyIGNoYXJhY3RlcnMgZm9yIEFFUy0yNTZcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoMTYpKTsgLy8gR2VuZXJhdGUgcmFuZG9tIElWICgxNiBieXRlcyBmb3IgQUVTKVxuXG4gICAgLy8gSW1wb3J0IHRoZSBrZXlcbiAgICBjb25zdCBjcnlwdG9LZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICdyYXcnLFxuICAgICAga2V5LFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycgfSxcbiAgICAgIGZhbHNlLFxuICAgICAgWydlbmNyeXB0J11cbiAgICApO1xuXG4gICAgLy8gRW5jcnlwdCB0aGUgcGxhaW50ZXh0XG4gICAgY29uc3QgZW5jb2RlZFBsYWludGV4dCA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShwbGFpbnRleHQpO1xuICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgaXY6IGl2IH0sXG4gICAgICBjcnlwdG9LZXksXG4gICAgICBlbmNvZGVkUGxhaW50ZXh0XG4gICAgKTtcblxuICAgIC8vIENvbWJpbmUgSVYgYW5kIGNpcGhlcnRleHQsIHRoZW4gZW5jb2RlIHRvIGJhc2U2NFxuICAgIGNvbnN0IGNvbWJpbmVkID0gbmV3IFVpbnQ4QXJyYXkoaXYuYnl0ZUxlbmd0aCArIGNpcGhlcnRleHQuYnl0ZUxlbmd0aCk7XG4gICAgY29tYmluZWQuc2V0KGl2LCAwKTtcbiAgICBjb21iaW5lZC5zZXQobmV3IFVpbnQ4QXJyYXkoY2lwaGVydGV4dCksIGl2LmJ5dGVMZW5ndGgpO1xuXG4gICAgLy8gQ29udmVydCB0byBiYXNlNjRcbiAgICByZXR1cm4gYnRvYShTdHJpbmcuZnJvbUNoYXJDb2RlKC4uLmNvbWJpbmVkKSk7XG4gIH1cblxuICBhc3luYyBwb3N0KG1ldGhvZDogc3RyaW5nLCBib2R5OiB7fSkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICBmb3IgKHZhciBba2V5LCBvYmpdIG9mIE9iamVjdC5lbnRyaWVzPGFueT4oYm9keSkpIHtcbiAgICAgIGlmIChrZXkgPT0gJ3ZhbHVlcycpIHtcbiAgICAgICAgZm9yICh2YXIgW2ZpZWxkLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMob2JqKSkge1xuICAgICAgICAgIGlmKHZhbHVlID09IG51bGwgfHwgdmFsdWUgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBkZWxldGUgb2JqW2ZpZWxkXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyh7XG4gICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6ICdYTUxIdHRwUmVxdWVzdCcsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0pO1xuICAgIGNvbnN0IHNhbHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICBjb25zdCBqc29uU3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAge1xuICAgICAgICAgICAgQVBJX0tFWTogdGhpcy5jb25maWc/LmFwaUtleSxcbiAgICAgICAgICAgIEFwcDogdGhpcy5jb25maWc/LmFwcCxcbiAgICAgICAgICAgIE1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYm9keVxuICAgICAgICApXG4gICAgICApO1xuXG4gICAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgdGhpcy5lbmNyeXB0UmVxdWVzdChqc29uU3RyaW5nKTtcbiAgICByZXR1cm4gYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5odHRwLnBvc3Q8YW55PihcbiAgICAgIHRoaXMuY29uZmlnPy5hcGkgKyAnPycgKyBzYWx0LFxuICAgICAgZW5jcnlwdGVkLFxuICAgICAgeyBoZWFkZXJzIH1cbiAgICApKTtcbiAgfVxuXG4gIFxuICAvLyBDUkVBVEUgUkVBRCBVUERBVEUgQU5EIERFTEVURSBIQU5ETEVSU1xuXG4gIC8qKlxuICAgICAqIFJ1bnMgYW4gaW5zZXJ0IHF1ZXJ5IHRvIHRoZSBzZXJ2ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcG9zdE9iamVjdCAtIEFuIG9iamVjdCBjb250YWluaW5nIHRhYmxlcywgYW5kIHZhbHVlcyBmb3IgdGhlIFNRTCBxdWVyeS5cbiAgICAgKiBAcmV0dXJucyBBIHJlc3Bvc2Ugb2JqZWN0IFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBkZXRhaWxzLnBhc3N3b3JkID0gdGhpcy5BUEkuaGFzaChkZXRhaWxzLnBhc3N3b3JkKTtcbiAgICAgKiBcbiAgICAgKiBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5BUEkuY3JlYXRlKHtcbiAgICAgKiAgIHRhYmxlczogJ2FkbWluJyxcbiAgICAgKiAgIHZhbHVlczoge1xuICAgICAqICAgICdlbWFpbCc6dGhpcy5BUEkuY29yZUZvcm1bJ2VtYWlsJ10sXG4gICAgICogICAgJ3Bhc3N3b3JkJzogdGhpcy5BUEkuY29yZUZvcm1bJ3Bhc3N3b3JkJ10sIFxuICAgICAqICB9LFxuICAgICAqIH0pO1xuICAgICAqIFxuICAgICAqIGlmKGRhdGEuc3VjY2Vzcyl7XG4gICAgICogIGNvbnNvbGUubG9nKGRhdGEub3V0cHV0KTtcbiAgICAgKiB9XG4gICAgICogXG4gICAqKi9cbiAgYXN5bmMgY3JlYXRlKHBvc3RPYmplY3Q6Q29yZUNyZWF0ZU9iamVjdCk6UHJvbWlzZTxDb3JlUmVzcG9uc2U+e1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICByZXR1cm4gIGF3YWl0IHRoaXMucG9zdCgnY3JlYXRlX2VudHJ5Jywge1xuICAgICAgJ2RhdGEnOiBKU09OLnN0cmluZ2lmeShwb3N0T2JqZWN0KSxcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAgICogUnVucyBhbiByZWFkIHF1ZXJ5IHRvIHRoZSBzZXJ2ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcG9zdE9iamVjdCAtIEFuIG9iamVjdCBjb250YWluaW5nIHNlbGVjdG9ycywgdGFibGVzLCBhbmQgY29uZGl0aW9ucyBmb3IgdGhlIFNRTCBxdWVyeS5cbiAgICAgKiBAcmV0dXJucyBBIHJlc3Bvc2Ugb2JqZWN0IFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5BUEkucmVhZCh7XG4gICAgICogICBzZWxlY3RvcnM6IFtcbiAgICAgKiAgICAgJ2ZfYWRtaW4uSUQnLFxuICAgICAqICAgICAnVXNlcm5hbWUnLFxuICAgICAqICAgICAnRW1haWwnLFxuICAgICAqICAgICAnQ09VTlQoZl9tZXNzYWdlcy5JRCkgYXMgaW5ib3gnXG4gICAgICogICBdLFxuICAgICAqICAgdGFibGVzOiAnZl9hZG1pbicsXG4gICAgICogICBjb25kaXRpb25zOiBgV0hFUkUgZW1haWwgPSAke3RoaXMuQVBJLmNvcmVGb3JtWydlbWFpbCddfWBcbiAgICAgKiB9KTtcbiAgICAgKiBcbiAgICAgKiBpZihkYXRhLnN1Y2Nlc3MgJiYgZGF0YS5vdXRwdXQubGVuZ3RoID4gMCl7XG4gICAgICogLy8gc2luZ2xlIG91dHB1dFxuICAgICAqICBjb25zb2xlLmxvZyhkYXRhLm91dHB1dFswXSk7XG4gICAgICogLy8gYWxsIG91dHRwdXRcbiAgICAgKiAgZm9yKGxldCByb3cgb2YgZGF0YS5vdXRwdXQpe1xuICAgICAqICAgIGNvbnNvbGUubG9nKHJvdyk7XG4gICAgICogIH1cbiAgICAgKiB9XG4gICAgICogXG4gICAqKi9cbiAgYXN5bmMgcmVhZChwb3N0T2JqZWN0OkNvcmVSZWFkT2JqZWN0KTpQcm9taXNlPENvcmVSZXNwb25zZT57XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCB0aGlzLnBvc3QoJ2dldF9lbnRyaWVzJywge1xuICAgICAgJ2RhdGEnOiBKU09OLnN0cmluZ2lmeShwb3N0T2JqZWN0KSxcbiAgICB9KVxuICB9XG4gICAvKipcbiAgICAgKiBSdW5zIGFuIHVwZGF0ZSBxdWVyeSB0byB0aGUgc2VydmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHBvc3RPYmplY3QgLSBBbiBvYmplY3QgY29udGFpbmluZyBzZWxlY3RvcnMsIHZhbHVlcyAsdGFibGVzLCBhbmQgY29uZGl0aW9ucyBmb3IgdGhlIFNRTCBxdWVyeS5cbiAgICAgKiBAcmV0dXJucyBBIHJlc3Bvc2Ugb2JqZWN0IFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBlbmNyeXB0ZWQgPSB0aGlzLkFQSS5oYXNoKHRoaXMuQVBJLmNvcmVGb3JtWydwYXNzd29yZCddKTtcbiAgICAgKiBcbiAgICAgKiBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5BUEkudXBkYXRlKHtcbiAgICAgKiAgIHRhYmxlczogJ2ZfYWRtaW4nLFxuICAgICAqICAgdmFsdWVzOiB7XG4gICAgICogICAgJ2VtYWlsJzp0aGlzLkFQSS5jb3JlRm9ybVsnZW1haWwnXSxcbiAgICAgKiAgICAncGFzc3dvcmQnOiBlbmNyeXB0ZWQsIFxuICAgICAqICAgfSxcbiAgICAgKiAgIGNvbmRpdGlvbnM6IGBXSEVSRSBlbWFpbCA9ICR7dGhpcy5BUEkuY29yZUZvcm1bJ2VtYWlsJ119YFxuICAgICAqIH0pO1xuICAgICAqIFxuICAgICAqIGlmKGRhdGEuc3VjY2Vzcyl7XG4gICAgICogICBjb25zb2xlLmxvZyhkYXRhLm91dHB1dCk7XG4gICAgICogfVxuICAgICAqIFxuICAgKiovXG4gIGFzeW5jIHVwZGF0ZShwb3N0T2JqZWN0OkNvcmVVcGRhdGVPYmplY3QpOlByb21pc2U8Q29yZVJlc3BvbnNlPntcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICByZXR1cm4gYXdhaXQgdGhpcy5wb3N0KCd1cGRhdGVfZW50cnknLCB7XG4gICAgJ2RhdGEnOiBKU09OLnN0cmluZ2lmeShwb3N0T2JqZWN0KSxcbiAgfSlcbiAgfVxuXG4gIC8qKlxuICAgICAqIFJ1bnMgYW4gZGVsZXRlIHF1ZXJ5IHRvIHRoZSBzZXJ2ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcG9zdE9iamVjdCAtIEFuIG9iamVjdCBjb250YWluaW5nIHRhYmxlcywgYW5kIGNvbmRpdGlvbnMgZm9yIHRoZSBTUUwgcXVlcnkuXG4gICAgICogQHJldHVybnMgQSByZXNwb3NlIG9iamVjdCBcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuQVBJLmRlbGV0ZSh7XG4gICAgICogICB0YWJsZXM6ICdmX2FkbWluJyxcbiAgICAgKiAgIGNvbmRpdGlvbnM6IGBXSEVSRSBlbWFpbCA9ICR7dGhpcy5BUEkuY29yZUZvcm1bJ2VtYWlsJ119YFxuICAgICAqIH0pO1xuICAgICAqIFxuICAgICAqIGlmKGRhdGEuc3VjY2Vzcyl7XG4gICAgICogICBjb25zb2xlLmxvZyhkYXRhLm91dHB1dCk7XG4gICAgICogfVxuICAgICAqIFxuICAgKiovXG4gIGFzeW5jIGRlbGV0ZShwb3N0T2JqZWN0OkNvcmVEZWxldGVPYmplY3QpOlByb21pc2U8Q29yZVJlc3BvbnNlPntcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMucG9zdCgnZGVsZXRlX2VudHJ5Jywge1xuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkocG9zdE9iamVjdCksXG4gICAgfSlcbiAgfVxuXG4gIC8vIEZJTEUgSEFORExFUlNcblxuICAgLyoqXG4gICAgICogR2V0IGNvbXBsZXRlIGZpbGUgVVJMIGZyb20gdGhlIHNlcnZlclxuICAgICAqXG4gICAgICogQHBhcmFtIGZpbGUgLSBBIHN0cmluZyB0aGF0IHBvaW50cyB0byB0aGUgZmlsZS5cbiAgICAgKiBAcmV0dXJucyBBIGNvbXBsZXRlIHVybCBzdHJpbmcgZnJvbSB0aGUgc2VydmVyIFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCB1cmwgPSB0aGlzLkFQSS5nZXRGaWxlVVJMKCdmaWxlcy9wcm9maWxlLnBuZycpO1xuICAgICAqIFxuICAgICAqIE9VVFBVVDpcbiAgICAgKiAgaHR0cHM6Ly9sb2NhbGhvc3Q6ODA4MC9maWxlcy9wcm9maWxlLnBuZ1xuICAgICAqIFxuICAgKiovXG4gIGdldEZpbGVVUkwoZmlsZTogc3RyaW5nKTpzdHJpbmd8dW5kZWZpbmVkIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoXCJQbGVhc2UgaW5pdGlhbGl6ZSB1c3dhZ29uIGNvcmUgb24gcm9vdCBhcHAuY29tcG9uZW50LnRzXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZmlsZSkge1xuICAgICAgaWYgKGZpbGUuaW5jbHVkZXMoJ2h0dHA6Ly8nKSB8fCBmaWxlLmluY2x1ZGVzKCdodHRwczovLycpKSByZXR1cm4gZmlsZTtcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZz8uc2VydmVyICsgYC8ke3RoaXMuY29uZmlnLmFwcH0vYCArIGZpbGUgO1xuICAgIH1cbiAgICByZXR1cm4gZmlsZTtcbiAgfVxuXG4gICAvKipcbiAgICAgKiBVcGxvYWRzIGEgZmlsZSB0byB0aGUgc2VydmVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZmlsZSAtIEEgRmlsZSB0byB1cGxvYWRcbiAgICAgKiBAcGFyYW0gZmlsZW5hbWUgLSBBIHN0cmluZyB0aGF0IHBvaW50cyB0byB3aGVyZSB0aGUgZmlsZSB0byBiZSBzdG9yZWQgaW4gdGhlIHNlcnZlclxuICAgICAqIEBwYXJhbSBjaHVua1NpemUgLSBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIG51bWJlciBvZiBieXRlcyB0byB1cGxvYWQgcGVyIGNodW5rXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFxuICAgICAqIGdldFVwbG9hZFByb2dyZXNzKCl7XG4gICAgICogIHJldHVybiB0aGlzLkFQSS51cGxvYWRQcm9ncmVzc1xuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBhd2FpdCB0aGlzLkFQSS51cGxvYWRGaWxlKHNvbWVmaWxlLCAnZmlsZXMvcHJvZmlsZS5wbmcnKTtcbiAgICAgKiBcbiAgICAgKiBPVVRQVVQ6XG4gICAgICogPGRpdj57e2dldFVwbG9hZFByb2dyZXNzKCl9fTxkaXY+IC8vIGR5bmFtaWNhbGx5IHVwZGF0ZXMgdGhlIHByb2dyZXNzXG4gICAqKi9cbiAgdXBsb2FkRmlsZShmaWxlOiBGaWxlLCBmaWxlbmFtZTogc3RyaW5nLCBjaHVua1NpemU6IG51bWJlciA9IDEwMjQgKiAxMDI0KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KFwiUGxlYXNlIGluaXRpYWxpemUgdXN3YWdvbiBjb3JlIG9uIHJvb3QgYXBwLmNvbXBvbmVudC50c1wiKTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKT0+e3JldHVybiBudWxsfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0b3RhbENodW5rcyA9IE1hdGguY2VpbChmaWxlLnNpemUgLyBjaHVua1NpemUpO1xuICAgICAgbGV0IHVwbG9hZGVkQ2h1bmtzID0gMDsgLy8gVHJhY2sgdXBsb2FkZWQgY2h1bmtzXG5cbiAgICAgIGNvbnN0IHVwbG9hZENodW5rID0gKGNodW5rSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICBjb25zdCBzdGFydCA9IGNodW5rSW5kZXggKiBjaHVua1NpemU7XG4gICAgICAgIGNvbnN0IGVuZCA9IE1hdGgubWluKHN0YXJ0ICsgY2h1bmtTaXplLCBmaWxlLnNpemUpO1xuICAgICAgICBjb25zdCBjaHVuayA9IGZpbGUuc2xpY2Uoc3RhcnQsIGVuZCk7XG5cbiAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgcmVhZGVyLm9ubG9hZGVuZCA9ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBiYXNlNjRTdHJpbmcgPSAocmVhZGVyLnJlc3VsdCBhcyBzdHJpbmcpLnNwbGl0KCcsJylbMV07XG5cbiAgICAgICAgICBjb25zdCAkc3ViID0gdGhpcy5odHRwXG4gICAgICAgICAgICAucG9zdCh0aGlzLmNvbmZpZz8ubm9kZXNlcnZlciArICcvZmlsZWhhbmRsZXItcHJvZ3Jlc3MnLCB7XG4gICAgICAgICAgICAgIGtleTogdGhpcy5jb25maWc/LmFwaUtleSxcbiAgICAgICAgICAgICAgYXBwOiB0aGlzLmNvbmZpZz8uYXBwLFxuICAgICAgICAgICAgICBtZXRob2Q6ICdjcmVhdGVfdXJsJyxcbiAgICAgICAgICAgICAgY2h1bms6IGJhc2U2NFN0cmluZyxcbiAgICAgICAgICAgICAgZmlsZU5hbWU6ICBmaWxlbmFtZSxcbiAgICAgICAgICAgICAgY2h1bmtJbmRleDogY2h1bmtJbmRleCxcbiAgICAgICAgICAgICAgdG90YWxDaHVua3M6IHRvdGFsQ2h1bmtzLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoe1xuICAgICAgICAgICAgICBuZXh0OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdXBsb2FkZWRDaHVua3MrKztcbiAgICAgICAgICAgICAgICB0aGlzLnVwbG9hZFByb2dyZXNzID0gTWF0aC5yb3VuZCgodXBsb2FkZWRDaHVua3MgLyB0b3RhbENodW5rcykgKiAxMDApO1xuICAgICAgICAgICAgICAgIGlmIChjaHVua0luZGV4ICsgMSA8IHRvdGFsQ2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgICAvLyBVcGxvYWQgbmV4dCBjaHVua1xuICAgICAgICAgICAgICAgICAgdXBsb2FkQ2h1bmsoY2h1bmtJbmRleCArIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgRmlsZSB1cGxvYWQgY29tcGxldGU6ICR7ZmlsZW5hbWV9YCk7XG4gICAgICAgICAgICAgICAgICB0aGlzLnVwbG9hZFByb2dyZXNzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgJHN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpOyAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIHdoZW4gdGhlIHVwbG9hZCBpcyBjb21wbGV0ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZXJyb3I6IChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAkc3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5lcnJvcignRXJyb3IgdXBsb2FkaW5nIGNodW5rJywgZXJyKTtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTsgLy8gUmVqZWN0IHRoZSBwcm9taXNlIG9uIGVycm9yXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChjaHVuayk7XG4gICAgICB9O1xuXG4gICAgICAvLyBTdGFydCB1cGxvYWRpbmcgdGhlIGZpcnN0IGNodW5rXG4gICAgICB1cGxvYWRDaHVuaygwKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGRpc3Bvc2VGaWxlKGZpbGVuYW1lOiBzdHJpbmcpe1xuICAgICAgYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5odHRwXG4gICAgICAucG9zdCh0aGlzLmNvbmZpZz8ubm9kZXNlcnZlciArICcvZmlsZWhhbmRsZXItcHJvZ3Jlc3MnLCB7XG4gICAgICAgIGtleTogdGhpcy5jb25maWc/LmFwaUtleSxcbiAgICAgICAgYXBwOiB0aGlzLmNvbmZpZz8uYXBwLFxuICAgICAgICBtZXRob2Q6ICdkZWxldGVfdXJsJyxcbiAgICAgICAgZmlsZU5hbWU6ICBmaWxlbmFtZSxcbiAgICAgIH0pKVxuICAgICAgO1xuICB9O1xuICBcbn1cbiJdfQ==