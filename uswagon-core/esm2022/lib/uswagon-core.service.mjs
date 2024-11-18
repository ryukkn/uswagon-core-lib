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
        this.connectToSocket(config);
    }
    connectToSocket(config) {
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
        this.socket.onclose = () => {
            console.log('Reconnecting to socket...');
            this.connectToSocket(config);
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
        if (this.coreFeedback.length >= 3) {
            this.coreFeedback.splice(0, 1);
        }
        const feedback = {
            id: this.createUniqueID32(),
            type: type,
            message: message,
        };
        if (timer != undefined) {
            // Set a timer to reset the snackbar feedback after 2 seconds
            feedback.timeout = setTimeout(() => {
                // this.coreFeedback[index] = undefined;
                const index = this.coreFeedback.findIndex(feedback => feedback.id == feedback.id);
                if (index >= 0) {
                    this.coreFeedback.splice(index, 1);
                }
            }, timer);
        }
        this.coreFeedback.push(feedback);
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
        const headers = new HttpHeaders({
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        });
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
                    }, { headers })
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
        const headers = new HttpHeaders({
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        });
        await firstValueFrom(this.http
            .post(this.config?.nodeserver + '/filehandler-progress', {
            key: this.config?.apiKey,
            app: this.config?.app,
            method: 'delete_url',
            fileName: filename,
        }, { headers }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1jb3JlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWNvcmUvc3JjL2xpYi91c3dhZ29uLWNvcmUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBYSxNQUFNLGVBQWUsQ0FBQztBQUd0RCxPQUFPLEVBQUcsZUFBZSxFQUFTLGNBQWMsRUFBRSxNQUFNLE1BQU0sQ0FBQzs7OztBQUsvRCxNQUFNLE9BQU8sa0JBQWtCO0lBNEM3QixZQUNVLElBQWdCLEVBQ2hCLE1BQWM7UUFEZCxTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ2hCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFuQ2hCLG1CQUFjLEdBQTZCLElBQUksZUFBZSxDQUFVLEtBQUssQ0FBQyxDQUFDO1FBQ3RGOzs7Ozs7OztXQVFHO1FBQ0csZUFBVSxHQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFaEQsaUJBQVksR0FBMEIsRUFBRSxDQUFDO1FBQ3pDLGVBQVUsR0FBWSxFQUFFLENBQUE7UUFDL0I7Ozs7Ozs7Ozs7O1dBV0c7UUFDRyxhQUFRLEdBQVksRUFBRSxDQUFBO1FBSXJCLGVBQVUsR0FBcUQsRUFBRSxDQUFDO1FBQ2xFLGdCQUFXLEdBQVUsSUFBSSxDQUFDO0lBSzlCLENBQUM7SUFFTCxpQkFBaUI7SUFDakI7Ozs7Ozs7Ozs7Ozs7UUFhSTtJQUNKLFVBQVUsQ0FBQyxNQUFpQjtRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxJQUFJLFNBQVMsRUFBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDN0MsQ0FB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QyxHQUFHLEVBQUUsRUFBRTs0QkFDYixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7NEJBQ25CLCtDQUErQzs0QkFDL0MsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsOEJBQThCO3dCQUM3QyxDQUFDO3FCQUNGLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUM7Z0JBRUYsTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUM7WUFFRixrQ0FBa0M7WUFDbEMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBZ0I7UUFDaEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxXQUFXLENBQUM7WUFDOUIsa0JBQWtCLEVBQUUsZ0JBQWdCO1lBQ3BDLGNBQWMsRUFBRSxrQkFBa0I7U0FDbkMsQ0FBQyxDQUFDO1FBQ0QsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUk7YUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxHQUFHLHVCQUF1QixFQUFFO1lBQ3ZELEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU07WUFDeEIsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRztZQUNyQixNQUFNLEVBQUUsWUFBWTtZQUNwQixRQUFRLEVBQUcsUUFBUTtTQUNwQixFQUNELEVBQUMsT0FBTyxFQUFDLENBQ1YsQ0FBQyxDQUNDO0lBQ0wsQ0FBQztJQUFBLENBQUM7K0dBdHZCUyxrQkFBa0I7bUhBQWxCLGtCQUFrQixjQUZqQixNQUFNOzs0RkFFUCxrQkFBa0I7a0JBSDlCLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cENsaWVudCwgSHR0cEhlYWRlcnMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBJbmplY3RhYmxlLCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBDb3JlQ29uZmlnLCBDb3JlQ3JlYXRlT2JqZWN0LCBDb3JlRGVsZXRlT2JqZWN0LCBDb3JlRm9ybSwgQ29yZVJlYWRPYmplY3QsIENvcmVSZXNwb25zZSwgQ29yZVVwZGF0ZU9iamVjdCwgU25hY2tiYXJDb3JlRmVlZGJhY2sgfSBmcm9tICcuL3R5cGVzL3Vzd2Fnb24tY29yZS50eXBlcyc7XG5pbXBvcnQgeyAgQmVoYXZpb3JTdWJqZWN0LCBmaXJzdCwgZmlyc3RWYWx1ZUZyb20gfSBmcm9tICdyeGpzJztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgVXN3YWdvbkNvcmVTZXJ2aWNlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgIC8qKlxuICAgICAqIFVwbG9hZCBwcm9ncmVzcyBpbmRpY2F0b3Igb24gY3VycmVudCBmaWxlIHVwbG9hZFxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogZ2V0VXBsb2FkUHJvZ3Jlc3MoKXtcbiAgICAgKiAgcmV0dXJuIHRoaXMuQVBJLnVwbG9hZFByb2dyZXNzO1xuICAgICAqIH1cbiAgICAgKiAgXG4gICAqKi9cbiAgcHVibGljIHVwbG9hZFByb2dyZXNzPzpudW1iZXI7XG4gIHByaXZhdGUgbG9hZGluZ1N1YmplY3Q6IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPiA9IG5ldyBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4oZmFsc2UpO1xuICAgLyoqXG4gICAgICogR2V0IGxvYWRpbmcgc3RhdHVzIG9mIHRoZSBBUElcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLmlzTG9hZGluZyQuc3Vic2NyaWJlKGxvYWRpbmcgPT4ge1xuICAgICAqICB0aGlzLmxvYWRpbmcgPSBsb2FkaW5nO1xuICAgICAqIH0pXG4gICAgICogIFxuICAgKiovXG4gIHB1YmxpYyBpc0xvYWRpbmckID0gIHRoaXMubG9hZGluZ1N1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG5cbiAgcHJpdmF0ZSBjb3JlRmVlZGJhY2s6U25hY2tiYXJDb3JlRmVlZGJhY2tbXSA9IFtdO1xuICBwcml2YXRlIHB1YmxpY0Zvcm06Q29yZUZvcm0gPSB7fVxuICAgLyoqXG4gICAgICogU2VjdXJlIGZvcm0gZm9yIHN0b3JpbmcgbW9yZSBzZWN1cmUgaW5wdXRcbiAgICAgKiBcbiAgICAgKiBOT1RFOiBUaGlzIGlzIHRoZSBmb3JtIHRoYXQgc2hvdWxkIGJlIHVzZWQgd2hlbiBidWlsZGluZyBwb3N0T2JqZWN0c1xuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogZm9yKGxldCBrZXkgaW4gdGhpcy5BUEkuY29yZUZvcm0pe1xuICAgICAqICAvLyBwcm9jZXNzIHZhbHVlXG4gICAgICogIGNvbnNvbGUubG9nKHRoaXMuQVBJLmNvcmVGb3JtW2tleV0pO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICoqL1xuICBwdWJsaWMgY29yZUZvcm06Q29yZUZvcm0gPSB7fVxuICBwcml2YXRlIHNvY2tldD86IFdlYlNvY2tldDtcbiAgcHJpdmF0ZSBjb25maWc/OiBDb3JlQ29uZmlnO1xuICBwcml2YXRlIHRpbWVvdXQ6YW55O1xuICBwcml2YXRlIGxpdmVFdmVudHM6e1trZXk6IHN0cmluZ106IChtZXNzYWdlOiBNZXNzYWdlRXZlbnQpID0+IHZvaWQgfSA9IHt9O1xuICBwcml2YXRlIGxvYWRlckRlbGF5Om51bWJlciA9IDMwMDA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXG4gICkgeyB9XG5cbiAgLy8gSU5JVElBTElaQVRJT05cbiAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIHNlcnZpY2UgZm9yIHRoZSBwcm9qZWN0XG4gICAgICogQHBhcmFtIGNvbmZpZyAtIGNvbmZpZ3VyYXRpb24gdGhhdCBwb2ludHMgdGhlIHNlcnZpY2UgdG8gaXRzIGFwcHJvcHJpYXRlIHNlcnZlclxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogdGhpcy5BUEkuaW5pdGlhbGl6ZSh7XG4gICAgICogIGFwaTplbnZpcm9ubWVudC5hcGksXG4gICAgICogIGFwaUtleTogZW52aXJvbm1lbnQuYXBpS2V5LFxuICAgICAqICBub2Rlc2VydmVyOiBlbnZpcm9ubWVudC5ub2Rlc2VydmVyLFxuICAgICAqICBzZXJ2ZXI6IGVudmlyb25tZW50LnNlcnZlcixcbiAgICAgKiAgc29ja2V0OiBlbnZpcm9ubWVudC5zb2NrZXRcbiAgICAgKiB9KVxuICAgICAqIFxuICAgKiovXG4gIGluaXRpYWxpemUoY29uZmlnOkNvcmVDb25maWcpe1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIGlmKHRoaXMuY29uZmlnLmxvYWRlckRlbGF5ICE9IHVuZGVmaW5lZCl7XG4gICAgICB0aGlzLmxvYWRlckRlbGF5ID0gdGhpcy5jb25maWcubG9hZGVyRGVsYXk7XG4gICAgfVxuICAgIHRoaXMuY29ubmVjdFRvU29ja2V0KGNvbmZpZyk7XG4gIH1cblxuICBwcml2YXRlIGNvbm5lY3RUb1NvY2tldChjb25maWc6Q29yZUNvbmZpZyl7XG4gICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KGNvbmZpZy5zb2NrZXQpO1xuICAgIHRoaXMuc29ja2V0LmJpbmFyeVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICAgIHRoaXMuc29ja2V0IS5vbm1lc3NhZ2UgPSAobWVzc2FnZSk9PntcbiAgICAgIHZhciBkZWNvZGVkTWVzc2FnZSA9IG5ldyBUZXh0RGVjb2RlcigndXRmLTgnKS5kZWNvZGUobWVzc2FnZS5kYXRhKTtcbiAgICAgIGNvbnN0IHNvY2tldERhdGEgPSBKU09OLnBhcnNlKGRlY29kZWRNZXNzYWdlKTtcbiAgICAgIGlmKHNvY2tldERhdGEuYXBwICE9IGNvbmZpZy5hcHApIHJldHVybjtcbiAgICAgIGZvciAoY29uc3QgaWQgaW4gdGhpcy5saXZlRXZlbnRzKSB7XG4gICAgICAgICAgdGhpcy5saXZlRXZlbnRzW2lkXShzb2NrZXREYXRhLmRhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNvY2tldC5vbmNsb3NlID0gKCk9PntcbiAgICAgIGNvbnNvbGUubG9nKCdSZWNvbm5lY3RpbmcgdG8gc29ja2V0Li4uJyk7XG4gICAgICB0aGlzLmNvbm5lY3RUb1NvY2tldChjb25maWcpO1xuICAgIH1cbiAgfVxuXG4gICAvKipcbiAgICAgKiBBZGQgYSBuZXcgbGl2ZSBsaXN0ZW5lciBmcm9tIHRoZSBzZXJ2ZXIncyB3ZWJzb2NrZXRcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gaWQgLSBVbmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIGxpc3RlbmVycyB0byBhdm9pZCBjb2xsaXNpb25zXG4gICAgICogQHBhcmFtIGhhbmRsZXIgLSBXZWJzb2NrZXQgbWVzc2FnZXMgYXJlIHBhc3NlZCB0byB0aGlzIGhhbmRsZXJcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdGhpcy5BUEkuYWRkTGl2ZUxpc3RlbmVyKCdldmVudC0xJywobWVzc2FnZSk9PntcbiAgICAgKiAgT1VUUFVUOlxuICAgICAqICAvLyBzYW1lIGFzIHRoZSBqc29uIHNlbnQgZnJvbSBzb2NrZXRTZW5kKGRhdGEpXG4gICAgICogIC8vIGxvZ2ljcyBhcmUgYXBwbGllZCBoZXJlIHNvIHRoYXQgbWVzc2FnZXMgYXJlIG9ubHkgcmVjZWl2ZWQgb24gc3BlY2lmaWMgY2xpZW50c1xuICAgICAqICBjb25zb2xlLmxvZyhtZXNzYWdlKTtcbiAgICAgKiB9KVxuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIGFkZFNvY2tldExpc3RlbmVyKCBpZDpzdHJpbmcsaGFuZGxlcjoobWVzc2FnZTogYW55KT0+dm9pZCkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICB0aGlzLmxpdmVFdmVudHNbaWRdPSBoYW5kbGVyO1xuICB9XG4gIC8qKlxuICAgICAqIEdldCBsaXN0IG9mIGxpdmUgbGlzdGVuZXJzIGluIHRoZSBwcm9qZWN0XG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuQVBJLmdldExpc3RlbmVycygpO1xuICAgICAqIFxuICAgICAqIE9VVFBVVDogQW4gYWxlcnQgc2hvd2luZyBsaXN0IG9mIGxpc3RlbmVyc1xuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIGdldExpc3RlbmVycygpIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgYWxlcnQoSlNPTi5zdHJpbmdpZnkoT2JqZWN0LmtleXModGhpcy5saXZlRXZlbnRzKSkpO1xuICB9XG4gIC8qKlxuICAgICAqIFNlbmRzIGEgbWVzc2FnZSB0byB0aGUgd2Vic29ja2V0XG4gICAgICogQHBhcmFtIGRhdGEgLSBBIGpzb24gb2JqZWN0IG1lc3NhZ2VcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdGhpcy5BUEkuc29ja2V0U2VuZCh7XG4gICAgICogICAgdG86IHN0dWRlbnQuaWQsXG4gICAgICogICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgKiB9KVxuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIHNvY2tldFNlbmQoZGF0YTogb2JqZWN0KSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgXG4gICAgdGhpcy5zb2NrZXQhLnNlbmQoXG4gICAgICBKU09OLnN0cmluZ2lmeSh7IGtleTogdGhpcy5jb25maWc/LmFwaUtleSwgYXBwOiB0aGlzLmNvbmZpZz8uYXBwLCBkYXRhOiBkYXRhIH0pXG4gICAgKTtcbiAgXG4gIH1cbiAgXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuc29ja2V0Py5jbG9zZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBwZ0VzY2FwZVN0cmluZyhpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodHlwZW9mIGlucHV0ICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnB1dCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgfSBcbiAgICAvLyBFc2NhcGUgc2luZ2xlIHF1b3RlcyBieSByZXBsYWNpbmcgdGhlbSB3aXRoIHR3byBzaW5nbGUgcXVvdGVzXG4gICAgcmV0dXJuIGlucHV0LnJlcGxhY2UoLycvZywgXCInJ1wiKS50cmltKCk7XG4gIH1cblxuICAvKipcbiAgICAgKiBCdWlsZHMgYSBDb3JlRm9ybSBmcm9tIHVzZXIgaW5wdXRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXkgLSBBIHN0cmluZyByZWZlcmVuY2UgdG8gZm9ybSBrZXlcbiAgICAgKiBAcGFyYW0gdmFsdWUgLSBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIGEgZm9ybSBrZXlcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFxuICAgICAqIGhhbmRsZUlucHV0KGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKXtcbiAgICAgKiAgdGhpcy5BUEkuaGFuZGxlRm9ybVZhbHVlKCdlbWFpbCcsIGV2ZW50LnRhcmdldC52YWx1ZSk7IC8vIGtleSBzaG91bGQgYmUgaW5pdGlhbGl6ZWQgdXNpbmcgaW5pdGlhbGl6ZUZvcm0oKVxuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBPVVRQVVQ6XG4gICAgICogPGlucHV0IChjaGFuZ2UpPSdoYW5kbGVJbnB1dChcImVtYWlsXCIsICRldmVudCknID4gXG4gICAgICpcbiAgICAgKiBcbiAgICAgKiBcbiAgICoqL1xuICBoYW5kbGVGb3JtVmFsdWUoa2V5OnN0cmluZywgdmFsdWU6c3RyaW5nKXtcbiAgICB0aGlzLnB1YmxpY0Zvcm1ba2V5XSA9IHZhbHVlOyBcbiAgICB0aGlzLmNvcmVGb3JtW2tleV0gPSB0aGlzLnBnRXNjYXBlU3RyaW5nKHZhbHVlKTtcbiAgfVxuICAgLyoqXG4gICAgICogQnVpbGRzIGEgQ29yZUZvcm0gZnJvbSB1c2VyIGlucHV0XG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5IC0gQSBzdHJpbmcgcmVmZXJlbmNlIHRvIGZvcm0ga2V5XG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBcbiAgICAgKiBnZXRJbnB1dChrZXk6c3RyaW5nKXtcbiAgICAgKiAgcmV0dXJuIHRoaXMuQVBJLmdldEZvcm1WYWx1ZShrZXkpO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBPVVRQVVQ6XG4gICAgICogPGRpdj57e2dldElucHV0KCdlbWFpbCcpfX08L2Rpdj5cbiAgICAgKiBcbiAgICoqL1xuICAgZ2V0Rm9ybVZhbHVlKGtleTpzdHJpbmcpe1xuICAgIGlmKHRoaXMucHVibGljRm9ybVtrZXldID09PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ1BsZWFzZSBpbml0aWFsaXplIHRoZSBmb3JtIHVzaW5nIGluaXRpYWxpemVGb3JtKFsuLi5maWVsZHNdKScpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wdWJsaWNGb3JtW2tleV07XG4gIH1cblxuICAvKipcbiAgICAgKiBJbml0aWFsaXplIGEgQ29yZUZvcm1cbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXlzIC0gQSBsaXN0IG9mIHN0cmluZ3MgcmVwcmVzZW50aW5nIGZvcm0ga2V5c1xuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogdGhpcy5BUEkuaW5pdGlhbGl6ZUZvcm0oWydlbWFpbCddKTtcbiAgICAgKiAgXG4gICAgICogT1VUUFVUOlxuICAgICAqIGNvbnNvbGUubG9nKHRoaXMuQVBJLmNvcmVGb3JtKTsgXG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgaW5pdGlhbGl6ZUZvcm0oa2V5czpzdHJpbmdbXSl7XG4gICAgdGhpcy5wdWJsaWNGb3JtID0ga2V5cy5yZWR1Y2UoKHByZXY6YW55LGN1cnI6YW55KT0+e1xuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24ocHJldiwge1tjdXJyXTonJ30pXG4gICAgfSx7fSlcbiAgICB0aGlzLmNvcmVGb3JtID0ga2V5cy5yZWR1Y2UoKHByZXY6YW55LGN1cnI6YW55KT0+e1xuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24ocHJldiwge1tjdXJyXTonJ30pXG4gICAgfSx7fSlcbiAgfVxuXG4gIC8vIFVUSUxJVElFU1xuICBwcml2YXRlIGxvYWRpbmdUaW1lb3V0OmFueTtcbiAgLyoqXG4gICAgICogTWFyayB0aGUgc3RhdHVzIG9mIHRoZSBBUEkgYXMgbG9hZGluZ1xuICAgICAqXG4gICAgICogQHBhcmFtIGlzTG9hZGluZyAtIEEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIEFQSSBpcyBsb2FkaW5nXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBcbiAgICAgKiB0aGlzLkFQSS5zZXRMb2FkaW5nKHRydWUpXG4gICAgICogXG4gICAgICogY29uc29sZS5sb2codGhpcy5BUEkuaXNMb2FkaW5nKTtcbiAgICAgKiBcbiAgICoqL1xuICBzZXRMb2FkaW5nKGlzTG9hZGluZzpib29sZWFuKXtcbiAgICBpZih0aGlzLmxvYWRpbmdUaW1lb3V0KXtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmxvYWRpbmdUaW1lb3V0KTtcbiAgICB9XG4gICAgaWYoIWlzTG9hZGluZyl7XG4gICAgICB0aGlzLmxvYWRpbmdUaW1lb3V0ID0gIHNldFRpbWVvdXQoKCk9PntcbiAgICAgICAgdGhpcy5sb2FkaW5nU3ViamVjdC5uZXh0KGlzTG9hZGluZyk7XG4gICAgICB9LCB0aGlzLmxvYWRlckRlbGF5KVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5sb2FkaW5nU3ViamVjdC5uZXh0KGlzTG9hZGluZyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGhhc2ggZnJvbSB0aGUgc2VydmVyIGZvciBlbmNyeXB0aW5nIGRhdGFcbiAgICAgKlxuICAgICAqIEBwYXJhbSB0eXBlIC0gYSB0eXBlIG9mIGZlZWRiYWNrIG1lc3NhZ2UgdG8gc2VuZFxuICAgICAqIFxuICAgICAqIEBwYXJhbSBtZXNzYWdlIC0gYSBzdHJpbmcgY29udGFpbmluZyB0aGUgbWVzc2FnZSB0byBzZW5kXG4gICAgICogXG4gICAgICogQHBhcmFtIHRpbWVyIC0gYSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBkZWxheSBmb3IgdGhlIGZlZWRiYWNrIHRvIGNsb3NlXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBcbiAgICAgKiB0aGlzLkFQSS5zZW5kRmVlZGJhY2soJ3N1Y2Nlc3MnLCAnUHVzaGVkIGRhdGEhJywgNTAwMClcbiAgICAgKiBcbiAgICoqL1xuICAgIHNlbmRGZWVkYmFjayh0eXBlOidzdWNjZXNzJ3wnZXJyb3InfCduZXV0cmFsJ3wnd2FybmluZycsbWVzc2FnZTpzdHJpbmcsIHRpbWVyPzpudW1iZXIpe1xuICAgICAgaWYodGhpcy5jb3JlRmVlZGJhY2subGVuZ3RoID49IDMpe1xuICAgICAgICB0aGlzLmNvcmVGZWVkYmFjay5zcGxpY2UoMCwgMSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGNvbnN0IGZlZWRiYWNrID0ge1xuICAgICAgICBpZDogdGhpcy5jcmVhdGVVbmlxdWVJRDMyKCksXG4gICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICB9IGFzIFNuYWNrYmFyQ29yZUZlZWRiYWNrO1xuICAgICAgXG4gICAgICBpZiAodGltZXIgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIFNldCBhIHRpbWVyIHRvIHJlc2V0IHRoZSBzbmFja2JhciBmZWVkYmFjayBhZnRlciAyIHNlY29uZHNcbiAgICAgICAgZmVlZGJhY2sudGltZW91dCA9ICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAvLyB0aGlzLmNvcmVGZWVkYmFja1tpbmRleF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmNvcmVGZWVkYmFjay5maW5kSW5kZXgoZmVlZGJhY2sgPT4gZmVlZGJhY2suaWQ9PSBmZWVkYmFjay5pZCk7XG4gICAgICAgICAgaWYoaW5kZXggPj0gMCl7XG4gICAgICAgICAgICB0aGlzLmNvcmVGZWVkYmFjay5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGltZXIpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNvcmVGZWVkYmFjay5wdXNoKGZlZWRiYWNrKSAgICAgIFxuICAgIH1cbiAgLyoqXG4gICAgICogQ2xvc2VzIGEgZmVlZGJhY2tcbiAgICAgKlxuICAgICAqIEBwYXJhbSBpbmRleCAtIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgaW5kZXggb2YgZmVlZGJhY2sgdG8gY2xvc2VcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFxuICAgICAqIHRoaXMuQVBJLnNlbmRGZWVkYmFjaygnc3VjY2VzcycsICdQdXNoZWQgZGF0YSEnKVxuICAgICAqIFxuICAgKiovXG4gIGNsb3NlRmVlZGJhY2soaW5kZXg6bnVtYmVyKXtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5jb3JlRmVlZGJhY2tbaW5kZXhdLnRpbWVvdXQpO1xuICAgIHRoaXMuY29yZUZlZWRiYWNrLnNwbGljZShpbmRleCwgMSk7XG4gIH1cbiAgLyoqXG4gICAgICogU3RvcmUgQVBJIGZlZWRiYWNrIGZvciBzbmFja2JhcnMgYW5kIG90aGVyIGRpc3BsYXkgZmVlZGJhY2tcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyAtIEEgbGlzdCBvZiBmZWVkYmFjayBvYmplY3RzIHdpdGgge3R5cGUsIG1lc3NhZ2V9XG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBcbiAgICAgKiBnZXRGZWVkYmFja3MoKXtcbiAgICAgKiAgIHJldHVybiB0aGlzLkFQSS5nZXRGZWVkYmFja3MoKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqICAvLyBTbmFja2JhcnMgaW4gYXBwLmNvbXBvbmVudC50cyAocm9vdClcbiAgICAgKiAgPGRpdiBjbGFzcz0nc25hY2tiYXInICpuZ0Zvcj0nbGV0IGZlZWRiYWNrIG9mIGdldEZlZWRiYWNrcygpJz4ge3tmZWVkYmFjay5tZXNzYWdlfX0gPC9kaXY+XG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgICBnZXRGZWVkYmFja3MoKXtcbiAgICAgIHJldHVybiB0aGlzLmNvcmVGZWVkYmFjaztcbiAgICB9XG4gICAvKipcbiAgICAgKiBDcmVhdGVzIGEgaGFzaCBmcm9tIHRoZSBzZXJ2ZXIgZm9yIG5vbiBkZWNyeXB0YWJsZSBkYXRhXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGV4dCAtIEEgc3RyaW5nIHRvIGVuY3J5cHRcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBBIHN0cmluZyBoYXNoIG9yIHRocm93cyBhbiBlcnJvciBpZiBhbiBlcnJvciBoYXMgb2NjdXJlZFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBoYXNoID0gdGhpcy5BUEkuaGFzaCgna2VuJyk7XG4gICAgICogXG4gICAgICogY29uc29sZS5sb2coaGFzaCk7XG4gICAgICogXG4gICAqKi9cbiAgYXN5bmMgaGFzaCh0ZXh0OnN0cmluZyl7XG4gICAgY29uc3QgcmVzcG9uc2UgPSAgYXdhaXQgdGhpcy5wb3N0KCdnZXRfaGFzaCcsIHt0ZXh0OiB0ZXh0fSlcbiAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgIHJldHVybiByZXNwb25zZS5vdXRwdXQ7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlcnZlciBFcnJvcicpO1xuXG4gICAgfVxuICB9XG4gICAvKipcbiAgICAgKiBFbmNyeXB0cyBhIHRleHQgXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGV4dCAtIEEgc3RyaW5nIHRvIGVuY3J5cHRcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBBIHN0cmluZyBhbiBlbmNyeXB0ZWQgdGV4dCBvciB0aHJvd3MgYW4gZXJyb3IgaWYgYW4gZXJyb3IgaGFzIG9jY3VyZWRcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZW5jcnlwdGVkID0gdGhpcy5BUEkuZW5jcnlwdCgna2VuJyk7XG4gICAgICogXG4gICAgICogY29uc29sZS5sb2coZW5jcnlwdGVkKTtcbiAgICAgKiBcbiAgICoqL1xuICAgYXN5bmMgZW5jcnlwdCh0ZXh0OnN0cmluZyl7XG4gICAgY29uc3QgcmVzcG9uc2UgPSAgYXdhaXQgdGhpcy5wb3N0KCdlbmNyeXB0Jywge3RleHQ6IHRleHR9KVxuICAgIGlmKHJlc3BvbnNlLnN1Y2Nlc3Mpe1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm91dHB1dDtcbiAgICB9ZWxzZXtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2VydmVyIEVycm9yJyk7XG5cbiAgICB9XG4gIH1cbiAgIC8qKlxuICAgICAqIERlY3J5cHQgYW4gZW5jcnlwdGVkIHRleHQgaW4gdGhlIHNlcnZlciB0byBnZXQgcGxhaW4gdGV4dFxuICAgICAqXG4gICAgICogQHBhcmFtIGVuY3J5cHRlZCAtIEEgc3RyaW5nIHRvIGVuY3J5cHRcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBBIHN0cmluZyB0aGUgcGxhaW4gdGV4dCBvZiBhbiBlbmNyeXB0ZWQgdGV4dCBvciBvciB0aHJvd3MgYW4gZXJyb3IgaWYgYW4gZXJyb3IgaGFzIG9jY3VyZWRcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgcGxhaW5UZXh0ID0gdGhpcy5BUEkuZGVjcnlwdCgnQXNpMTJpVVNJRFVBSVNEVTEyJyk7XG4gICAgICogXG4gICAgICogY29uc29sZS5sb2cocGxhaW5UZXh0KTtcbiAgICAgKiBcbiAgICoqL1xuICAgYXN5bmMgZGVjcnlwdChlbmNyeXB0ZWQ6c3RyaW5nKXtcbiAgICBjb25zdCByZXNwb25zZSA9ICBhd2FpdCB0aGlzLnBvc3QoJ2RlY3J5cHQnLCB7ZW5jcnlwdGVkOiBlbmNyeXB0ZWR9KVxuICAgIGlmKHJlc3BvbnNlLnN1Y2Nlc3Mpe1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm91dHB1dDtcbiAgICB9ZWxzZXtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2VydmVyIEVycm9yJyk7XG4gICAgfVxuICB9XG4gICAvKipcbiAgICAgKiBDaGVja3MgaWYgYSB2YWx1ZSBtYXRjaGVzIGEgaGFzaFxuICAgICAqXG4gICAgICogQHBhcmFtIHRleHQgLSBBIHN0cmluZyB0byBjaGVja1xuICAgICAqIFxuICAgICAqIEBwYXJhbSBoYXNoIC0gQSBoYXNoIHN0cmluZyB0byBjaGVja1xuICAgICAqIFxuICAgICAqIEByZXR1cm5zIC0gVHJ1ZSBpZiB0ZXh0IGFuZCBoYXNoIG1hdGNoZXMsIGZhbHNlIG90aGVyd2lzZS4gVGhyb3dzIGFuIGVycm9yIGlmIGFuIGVycm9yIGhhcyBvY2N1cnJlZC5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgbWF0Y2ggPSB0aGlzLkFQSS52ZXJpZnlIYXNoKCd0ZXh0JywnJDJhYXNka2syLjEyM2kxMjNpamFzdWRma2xhanNkbGEnKTtcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyhtYXRjaCk7XG4gICAgICogXG4gICAqKi9cbiAgIGFzeW5jIHZlcmlmeUhhc2godGV4dDpzdHJpbmcsaGFzaDpzdHJpbmcpe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gIGF3YWl0IHRoaXMucG9zdCgndmVyaWZ5X2hhc2gnLCB7dGV4dDogdGV4dCwgaGFzaDpoYXNofSlcbiAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgIHJldHVybiByZXNwb25zZS5vdXRwdXQ7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlcnZlciBFcnJvcicpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICAgKiBDcmVhdGVzIGEgdW5pcXVlIGlkZW50aWZpZXIgd2l0aCB0aGUgbGVuZ3RoIG9mIDMyXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBIHJhbmRvbSB1bmlxdWUgMzIgc3RyaW5nIGlkZW50aWZpZXJcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgaWQgPSB0aGlzLkFQSS5jcmVhdGVVbmlxdWVJRDMyKCk7XG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgY3JlYXRlVW5pcXVlSUQzMigpIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgY29uc3QgdGltZXN0YW1wID0gRGF0ZS5ub3coKS50b1N0cmluZygxNik7IC8vIEdldCBjdXJyZW50IHRpbWUgaW4gaGV4XG4gICAgICBjb25zdCByYW5kb21QYXJ0ID0gJ3h4eHh4eHh4eHh4eHh4eHgnLnJlcGxhY2UoL3gvZywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIDE2IHwgMCkudG9TdHJpbmcoMTYpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGltZXN0YW1wICsgcmFuZG9tUGFydC5zbGljZSgwLCAxNik7IC8vIENvbWJpbmUgdGltZXN0YW1wIHdpdGggcmFuZG9tIHBhcnRcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZW5jcnlwdFJlcXVlc3QocGxhaW50ZXh0OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGtleVN0cmluZyA9ICdBSFM4NTc2NTk4UElPVU5BMjE0ODQyNzgwMzA5bXBxYkgnO1xuICAgIGNvbnN0IGtleSA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShrZXlTdHJpbmcuc2xpY2UoMCwgMzIpKTsgLy8gVXNlIG9ubHkgdGhlIGZpcnN0IDMyIGNoYXJhY3RlcnMgZm9yIEFFUy0yNTZcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoMTYpKTsgLy8gR2VuZXJhdGUgcmFuZG9tIElWICgxNiBieXRlcyBmb3IgQUVTKVxuXG4gICAgLy8gSW1wb3J0IHRoZSBrZXlcbiAgICBjb25zdCBjcnlwdG9LZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICdyYXcnLFxuICAgICAga2V5LFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycgfSxcbiAgICAgIGZhbHNlLFxuICAgICAgWydlbmNyeXB0J11cbiAgICApO1xuXG4gICAgLy8gRW5jcnlwdCB0aGUgcGxhaW50ZXh0XG4gICAgY29uc3QgZW5jb2RlZFBsYWludGV4dCA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShwbGFpbnRleHQpO1xuICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgaXY6IGl2IH0sXG4gICAgICBjcnlwdG9LZXksXG4gICAgICBlbmNvZGVkUGxhaW50ZXh0XG4gICAgKTtcblxuICAgIC8vIENvbWJpbmUgSVYgYW5kIGNpcGhlcnRleHQsIHRoZW4gZW5jb2RlIHRvIGJhc2U2NFxuICAgIGNvbnN0IGNvbWJpbmVkID0gbmV3IFVpbnQ4QXJyYXkoaXYuYnl0ZUxlbmd0aCArIGNpcGhlcnRleHQuYnl0ZUxlbmd0aCk7XG4gICAgY29tYmluZWQuc2V0KGl2LCAwKTtcbiAgICBjb21iaW5lZC5zZXQobmV3IFVpbnQ4QXJyYXkoY2lwaGVydGV4dCksIGl2LmJ5dGVMZW5ndGgpO1xuXG4gICAgLy8gQ29udmVydCB0byBiYXNlNjRcbiAgICByZXR1cm4gYnRvYShTdHJpbmcuZnJvbUNoYXJDb2RlKC4uLmNvbWJpbmVkKSk7XG4gIH1cblxuICBhc3luYyBwb3N0KG1ldGhvZDogc3RyaW5nLCBib2R5OiB7fSkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICBmb3IgKHZhciBba2V5LCBvYmpdIG9mIE9iamVjdC5lbnRyaWVzPGFueT4oYm9keSkpIHtcbiAgICAgIGlmIChrZXkgPT0gJ3ZhbHVlcycpIHtcbiAgICAgICAgZm9yICh2YXIgW2ZpZWxkLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMob2JqKSkge1xuICAgICAgICAgIGlmKHZhbHVlID09IG51bGwgfHwgdmFsdWUgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBkZWxldGUgb2JqW2ZpZWxkXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyh7XG4gICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6ICdYTUxIdHRwUmVxdWVzdCcsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0pO1xuICAgIGNvbnN0IHNhbHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICBjb25zdCBqc29uU3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAge1xuICAgICAgICAgICAgQVBJX0tFWTogdGhpcy5jb25maWc/LmFwaUtleSxcbiAgICAgICAgICAgIEFwcDogdGhpcy5jb25maWc/LmFwcCxcbiAgICAgICAgICAgIE1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYm9keVxuICAgICAgICApXG4gICAgICApO1xuXG4gICAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgdGhpcy5lbmNyeXB0UmVxdWVzdChqc29uU3RyaW5nKTtcbiAgICByZXR1cm4gYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5odHRwLnBvc3Q8YW55PihcbiAgICAgIHRoaXMuY29uZmlnPy5hcGkgKyAnPycgKyBzYWx0LFxuICAgICAgZW5jcnlwdGVkLFxuICAgICAgeyBoZWFkZXJzIH1cbiAgICApKTtcbiAgfVxuXG4gIFxuICAvLyBDUkVBVEUgUkVBRCBVUERBVEUgQU5EIERFTEVURSBIQU5ETEVSU1xuXG4gIC8qKlxuICAgICAqIFJ1bnMgYW4gaW5zZXJ0IHF1ZXJ5IHRvIHRoZSBzZXJ2ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcG9zdE9iamVjdCAtIEFuIG9iamVjdCBjb250YWluaW5nIHRhYmxlcywgYW5kIHZhbHVlcyBmb3IgdGhlIFNRTCBxdWVyeS5cbiAgICAgKiBAcmV0dXJucyBBIHJlc3Bvc2Ugb2JqZWN0IFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBkZXRhaWxzLnBhc3N3b3JkID0gdGhpcy5BUEkuaGFzaChkZXRhaWxzLnBhc3N3b3JkKTtcbiAgICAgKiBcbiAgICAgKiBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5BUEkuY3JlYXRlKHtcbiAgICAgKiAgIHRhYmxlczogJ2FkbWluJyxcbiAgICAgKiAgIHZhbHVlczoge1xuICAgICAqICAgICdlbWFpbCc6dGhpcy5BUEkuY29yZUZvcm1bJ2VtYWlsJ10sXG4gICAgICogICAgJ3Bhc3N3b3JkJzogdGhpcy5BUEkuY29yZUZvcm1bJ3Bhc3N3b3JkJ10sIFxuICAgICAqICB9LFxuICAgICAqIH0pO1xuICAgICAqIFxuICAgICAqIGlmKGRhdGEuc3VjY2Vzcyl7XG4gICAgICogIGNvbnNvbGUubG9nKGRhdGEub3V0cHV0KTtcbiAgICAgKiB9XG4gICAgICogXG4gICAqKi9cbiAgYXN5bmMgY3JlYXRlKHBvc3RPYmplY3Q6Q29yZUNyZWF0ZU9iamVjdCk6UHJvbWlzZTxDb3JlUmVzcG9uc2U+e1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICByZXR1cm4gIGF3YWl0IHRoaXMucG9zdCgnY3JlYXRlX2VudHJ5Jywge1xuICAgICAgJ2RhdGEnOiBKU09OLnN0cmluZ2lmeShwb3N0T2JqZWN0KSxcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAgICogUnVucyBhbiByZWFkIHF1ZXJ5IHRvIHRoZSBzZXJ2ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcG9zdE9iamVjdCAtIEFuIG9iamVjdCBjb250YWluaW5nIHNlbGVjdG9ycywgdGFibGVzLCBhbmQgY29uZGl0aW9ucyBmb3IgdGhlIFNRTCBxdWVyeS5cbiAgICAgKiBAcmV0dXJucyBBIHJlc3Bvc2Ugb2JqZWN0IFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5BUEkucmVhZCh7XG4gICAgICogICBzZWxlY3RvcnM6IFtcbiAgICAgKiAgICAgJ2ZfYWRtaW4uSUQnLFxuICAgICAqICAgICAnVXNlcm5hbWUnLFxuICAgICAqICAgICAnRW1haWwnLFxuICAgICAqICAgICAnQ09VTlQoZl9tZXNzYWdlcy5JRCkgYXMgaW5ib3gnXG4gICAgICogICBdLFxuICAgICAqICAgdGFibGVzOiAnZl9hZG1pbicsXG4gICAgICogICBjb25kaXRpb25zOiBgV0hFUkUgZW1haWwgPSAke3RoaXMuQVBJLmNvcmVGb3JtWydlbWFpbCddfWBcbiAgICAgKiB9KTtcbiAgICAgKiBcbiAgICAgKiBpZihkYXRhLnN1Y2Nlc3MgJiYgZGF0YS5vdXRwdXQubGVuZ3RoID4gMCl7XG4gICAgICogLy8gc2luZ2xlIG91dHB1dFxuICAgICAqICBjb25zb2xlLmxvZyhkYXRhLm91dHB1dFswXSk7XG4gICAgICogLy8gYWxsIG91dHRwdXRcbiAgICAgKiAgZm9yKGxldCByb3cgb2YgZGF0YS5vdXRwdXQpe1xuICAgICAqICAgIGNvbnNvbGUubG9nKHJvdyk7XG4gICAgICogIH1cbiAgICAgKiB9XG4gICAgICogXG4gICAqKi9cbiAgYXN5bmMgcmVhZChwb3N0T2JqZWN0OkNvcmVSZWFkT2JqZWN0KTpQcm9taXNlPENvcmVSZXNwb25zZT57XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCB0aGlzLnBvc3QoJ2dldF9lbnRyaWVzJywge1xuICAgICAgJ2RhdGEnOiBKU09OLnN0cmluZ2lmeShwb3N0T2JqZWN0KSxcbiAgICB9KVxuICB9XG4gICAvKipcbiAgICAgKiBSdW5zIGFuIHVwZGF0ZSBxdWVyeSB0byB0aGUgc2VydmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHBvc3RPYmplY3QgLSBBbiBvYmplY3QgY29udGFpbmluZyBzZWxlY3RvcnMsIHZhbHVlcyAsdGFibGVzLCBhbmQgY29uZGl0aW9ucyBmb3IgdGhlIFNRTCBxdWVyeS5cbiAgICAgKiBAcmV0dXJucyBBIHJlc3Bvc2Ugb2JqZWN0IFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBlbmNyeXB0ZWQgPSB0aGlzLkFQSS5oYXNoKHRoaXMuQVBJLmNvcmVGb3JtWydwYXNzd29yZCddKTtcbiAgICAgKiBcbiAgICAgKiBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5BUEkudXBkYXRlKHtcbiAgICAgKiAgIHRhYmxlczogJ2ZfYWRtaW4nLFxuICAgICAqICAgdmFsdWVzOiB7XG4gICAgICogICAgJ2VtYWlsJzp0aGlzLkFQSS5jb3JlRm9ybVsnZW1haWwnXSxcbiAgICAgKiAgICAncGFzc3dvcmQnOiBlbmNyeXB0ZWQsIFxuICAgICAqICAgfSxcbiAgICAgKiAgIGNvbmRpdGlvbnM6IGBXSEVSRSBlbWFpbCA9ICR7dGhpcy5BUEkuY29yZUZvcm1bJ2VtYWlsJ119YFxuICAgICAqIH0pO1xuICAgICAqIFxuICAgICAqIGlmKGRhdGEuc3VjY2Vzcyl7XG4gICAgICogICBjb25zb2xlLmxvZyhkYXRhLm91dHB1dCk7XG4gICAgICogfVxuICAgICAqIFxuICAgKiovXG4gIGFzeW5jIHVwZGF0ZShwb3N0T2JqZWN0OkNvcmVVcGRhdGVPYmplY3QpOlByb21pc2U8Q29yZVJlc3BvbnNlPntcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICByZXR1cm4gYXdhaXQgdGhpcy5wb3N0KCd1cGRhdGVfZW50cnknLCB7XG4gICAgJ2RhdGEnOiBKU09OLnN0cmluZ2lmeShwb3N0T2JqZWN0KSxcbiAgfSlcbiAgfVxuXG4gIC8qKlxuICAgICAqIFJ1bnMgYW4gZGVsZXRlIHF1ZXJ5IHRvIHRoZSBzZXJ2ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcG9zdE9iamVjdCAtIEFuIG9iamVjdCBjb250YWluaW5nIHRhYmxlcywgYW5kIGNvbmRpdGlvbnMgZm9yIHRoZSBTUUwgcXVlcnkuXG4gICAgICogQHJldHVybnMgQSByZXNwb3NlIG9iamVjdCBcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuQVBJLmRlbGV0ZSh7XG4gICAgICogICB0YWJsZXM6ICdmX2FkbWluJyxcbiAgICAgKiAgIGNvbmRpdGlvbnM6IGBXSEVSRSBlbWFpbCA9ICR7dGhpcy5BUEkuY29yZUZvcm1bJ2VtYWlsJ119YFxuICAgICAqIH0pO1xuICAgICAqIFxuICAgICAqIGlmKGRhdGEuc3VjY2Vzcyl7XG4gICAgICogICBjb25zb2xlLmxvZyhkYXRhLm91dHB1dCk7XG4gICAgICogfVxuICAgICAqIFxuICAgKiovXG4gIGFzeW5jIGRlbGV0ZShwb3N0T2JqZWN0OkNvcmVEZWxldGVPYmplY3QpOlByb21pc2U8Q29yZVJlc3BvbnNlPntcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMucG9zdCgnZGVsZXRlX2VudHJ5Jywge1xuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkocG9zdE9iamVjdCksXG4gICAgfSlcbiAgfVxuXG4gIC8vIEZJTEUgSEFORExFUlNcblxuICAgLyoqXG4gICAgICogR2V0IGNvbXBsZXRlIGZpbGUgVVJMIGZyb20gdGhlIHNlcnZlclxuICAgICAqXG4gICAgICogQHBhcmFtIGZpbGUgLSBBIHN0cmluZyB0aGF0IHBvaW50cyB0byB0aGUgZmlsZS5cbiAgICAgKiBAcmV0dXJucyBBIGNvbXBsZXRlIHVybCBzdHJpbmcgZnJvbSB0aGUgc2VydmVyIFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCB1cmwgPSB0aGlzLkFQSS5nZXRGaWxlVVJMKCdmaWxlcy9wcm9maWxlLnBuZycpO1xuICAgICAqIFxuICAgICAqIE9VVFBVVDpcbiAgICAgKiAgaHR0cHM6Ly9sb2NhbGhvc3Q6ODA4MC9maWxlcy9wcm9maWxlLnBuZ1xuICAgICAqIFxuICAgKiovXG4gIGdldEZpbGVVUkwoZmlsZTogc3RyaW5nKTpzdHJpbmd8dW5kZWZpbmVkIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoXCJQbGVhc2UgaW5pdGlhbGl6ZSB1c3dhZ29uIGNvcmUgb24gcm9vdCBhcHAuY29tcG9uZW50LnRzXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZmlsZSkge1xuICAgICAgaWYgKGZpbGUuaW5jbHVkZXMoJ2h0dHA6Ly8nKSB8fCBmaWxlLmluY2x1ZGVzKCdodHRwczovLycpKSByZXR1cm4gZmlsZTtcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZz8uc2VydmVyICsgYC8ke3RoaXMuY29uZmlnLmFwcH0vYCArIGZpbGUgO1xuICAgIH1cbiAgICByZXR1cm4gZmlsZTtcbiAgfVxuXG4gICAvKipcbiAgICAgKiBVcGxvYWRzIGEgZmlsZSB0byB0aGUgc2VydmVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZmlsZSAtIEEgRmlsZSB0byB1cGxvYWRcbiAgICAgKiBAcGFyYW0gZmlsZW5hbWUgLSBBIHN0cmluZyB0aGF0IHBvaW50cyB0byB3aGVyZSB0aGUgZmlsZSB0byBiZSBzdG9yZWQgaW4gdGhlIHNlcnZlclxuICAgICAqIEBwYXJhbSBjaHVua1NpemUgLSBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIG51bWJlciBvZiBieXRlcyB0byB1cGxvYWQgcGVyIGNodW5rXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFxuICAgICAqIGdldFVwbG9hZFByb2dyZXNzKCl7XG4gICAgICogIHJldHVybiB0aGlzLkFQSS51cGxvYWRQcm9ncmVzc1xuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBhd2FpdCB0aGlzLkFQSS51cGxvYWRGaWxlKHNvbWVmaWxlLCAnZmlsZXMvcHJvZmlsZS5wbmcnKTtcbiAgICAgKiBcbiAgICAgKiBPVVRQVVQ6XG4gICAgICogPGRpdj57e2dldFVwbG9hZFByb2dyZXNzKCl9fTxkaXY+IC8vIGR5bmFtaWNhbGx5IHVwZGF0ZXMgdGhlIHByb2dyZXNzXG4gICAqKi9cbiAgdXBsb2FkRmlsZShmaWxlOiBGaWxlLCBmaWxlbmFtZTogc3RyaW5nLCBjaHVua1NpemU6IG51bWJlciA9IDEwMjQgKiAxMDI0KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KFwiUGxlYXNlIGluaXRpYWxpemUgdXN3YWdvbiBjb3JlIG9uIHJvb3QgYXBwLmNvbXBvbmVudC50c1wiKTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKT0+e3JldHVybiBudWxsfSk7XG4gICAgfVxuXG4gICAgY29uc3QgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyh7XG4gICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6ICdYTUxIdHRwUmVxdWVzdCcsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0pO1xuICAgIFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0b3RhbENodW5rcyA9IE1hdGguY2VpbChmaWxlLnNpemUgLyBjaHVua1NpemUpO1xuICAgICAgbGV0IHVwbG9hZGVkQ2h1bmtzID0gMDsgLy8gVHJhY2sgdXBsb2FkZWQgY2h1bmtzXG5cbiAgICAgIGNvbnN0IHVwbG9hZENodW5rID0gKGNodW5rSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICBjb25zdCBzdGFydCA9IGNodW5rSW5kZXggKiBjaHVua1NpemU7XG4gICAgICAgIGNvbnN0IGVuZCA9IE1hdGgubWluKHN0YXJ0ICsgY2h1bmtTaXplLCBmaWxlLnNpemUpO1xuICAgICAgICBjb25zdCBjaHVuayA9IGZpbGUuc2xpY2Uoc3RhcnQsIGVuZCk7XG5cbiAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgcmVhZGVyLm9ubG9hZGVuZCA9ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBiYXNlNjRTdHJpbmcgPSAocmVhZGVyLnJlc3VsdCBhcyBzdHJpbmcpLnNwbGl0KCcsJylbMV07XG5cbiAgICAgICAgICBjb25zdCAkc3ViID0gdGhpcy5odHRwXG4gICAgICAgICAgICAucG9zdCh0aGlzLmNvbmZpZz8ubm9kZXNlcnZlciArICcvZmlsZWhhbmRsZXItcHJvZ3Jlc3MnLCB7XG4gICAgICAgICAgICAgIGtleTogdGhpcy5jb25maWc/LmFwaUtleSxcbiAgICAgICAgICAgICAgYXBwOiB0aGlzLmNvbmZpZz8uYXBwLFxuICAgICAgICAgICAgICBtZXRob2Q6ICdjcmVhdGVfdXJsJyxcbiAgICAgICAgICAgICAgY2h1bms6IGJhc2U2NFN0cmluZyxcbiAgICAgICAgICAgICAgZmlsZU5hbWU6ICBmaWxlbmFtZSxcbiAgICAgICAgICAgICAgY2h1bmtJbmRleDogY2h1bmtJbmRleCxcbiAgICAgICAgICAgICAgdG90YWxDaHVua3M6IHRvdGFsQ2h1bmtzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtoZWFkZXJzfVxuICAgICAgICAgIClcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoe1xuICAgICAgICAgICAgICBuZXh0OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdXBsb2FkZWRDaHVua3MrKztcbiAgICAgICAgICAgICAgICB0aGlzLnVwbG9hZFByb2dyZXNzID0gTWF0aC5yb3VuZCgodXBsb2FkZWRDaHVua3MgLyB0b3RhbENodW5rcykgKiAxMDApO1xuICAgICAgICAgICAgICAgIGlmIChjaHVua0luZGV4ICsgMSA8IHRvdGFsQ2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgICAvLyBVcGxvYWQgbmV4dCBjaHVua1xuICAgICAgICAgICAgICAgICAgdXBsb2FkQ2h1bmsoY2h1bmtJbmRleCArIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgRmlsZSB1cGxvYWQgY29tcGxldGU6ICR7ZmlsZW5hbWV9YCk7XG4gICAgICAgICAgICAgICAgICB0aGlzLnVwbG9hZFByb2dyZXNzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgJHN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpOyAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIHdoZW4gdGhlIHVwbG9hZCBpcyBjb21wbGV0ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZXJyb3I6IChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAkc3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5lcnJvcignRXJyb3IgdXBsb2FkaW5nIGNodW5rJywgZXJyKTtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTsgLy8gUmVqZWN0IHRoZSBwcm9taXNlIG9uIGVycm9yXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChjaHVuayk7XG4gICAgICB9O1xuXG4gICAgICAvLyBTdGFydCB1cGxvYWRpbmcgdGhlIGZpcnN0IGNodW5rXG4gICAgICB1cGxvYWRDaHVuaygwKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGRpc3Bvc2VGaWxlKGZpbGVuYW1lOiBzdHJpbmcpe1xuICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoe1xuICAgICAgJ1gtUmVxdWVzdGVkLVdpdGgnOiAnWE1MSHR0cFJlcXVlc3QnLFxuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICB9KTtcbiAgICAgIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMuaHR0cFxuICAgICAgLnBvc3QodGhpcy5jb25maWc/Lm5vZGVzZXJ2ZXIgKyAnL2ZpbGVoYW5kbGVyLXByb2dyZXNzJywge1xuICAgICAgICBrZXk6IHRoaXMuY29uZmlnPy5hcGlLZXksXG4gICAgICAgIGFwcDogdGhpcy5jb25maWc/LmFwcCxcbiAgICAgICAgbWV0aG9kOiAnZGVsZXRlX3VybCcsXG4gICAgICAgIGZpbGVOYW1lOiAgZmlsZW5hbWUsXG4gICAgICB9LFxuICAgICAge2hlYWRlcnN9XG4gICAgKSlcbiAgICAgIDtcbiAgfTtcbiAgXG59XG4iXX0=