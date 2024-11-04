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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1jb3JlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWNvcmUvc3JjL2xpYi91c3dhZ29uLWNvcmUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBYSxNQUFNLGVBQWUsQ0FBQztBQUd0RCxPQUFPLEVBQUcsZUFBZSxFQUFTLGNBQWMsRUFBRSxNQUFNLE1BQU0sQ0FBQzs7OztBQUsvRCxNQUFNLE9BQU8sa0JBQWtCO0lBNEM3QixZQUNVLElBQWdCLEVBQ2hCLE1BQWM7UUFEZCxTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ2hCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFuQ2hCLG1CQUFjLEdBQTZCLElBQUksZUFBZSxDQUFVLEtBQUssQ0FBQyxDQUFDO1FBQ3RGOzs7Ozs7OztXQVFHO1FBQ0csZUFBVSxHQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFaEQsaUJBQVksR0FBMEIsRUFBRSxDQUFDO1FBQ3pDLGVBQVUsR0FBWSxFQUFFLENBQUE7UUFDL0I7Ozs7Ozs7Ozs7O1dBV0c7UUFDRyxhQUFRLEdBQVksRUFBRSxDQUFBO1FBSXJCLGVBQVUsR0FBcUQsRUFBRSxDQUFDO1FBQ2xFLGdCQUFXLEdBQVUsSUFBSSxDQUFDO0lBSzlCLENBQUM7SUFFTCxpQkFBaUI7SUFDakI7Ozs7Ozs7Ozs7Ozs7UUFhSTtJQUNKLFVBQVUsQ0FBQyxNQUFpQjtRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxJQUFJLFNBQVMsRUFBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDN0MsQ0FB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QkFDRixDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDO2dCQUVGLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDO1lBRUYsa0NBQWtDO1lBQ2xDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQWdCO1FBQzlCLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJO2FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVUsR0FBRyx1QkFBdUIsRUFBRTtZQUN2RCxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNO1lBQ3hCLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUc7WUFDckIsTUFBTSxFQUFFLFlBQVk7WUFDcEIsUUFBUSxFQUFHLFFBQVE7U0FDcEIsQ0FBQyxDQUFDLENBQ0Y7SUFDTCxDQUFDO0lBQUEsQ0FBQzsrR0F4dUJTLGtCQUFrQjttSEFBbEIsa0JBQWtCLGNBRmpCLE1BQU07OzRGQUVQLGtCQUFrQjtrQkFIOUIsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwSGVhZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IEluamVjdGFibGUsIE9uRGVzdHJveSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IENvcmVDb25maWcsIENvcmVDcmVhdGVPYmplY3QsIENvcmVEZWxldGVPYmplY3QsIENvcmVGb3JtLCBDb3JlUmVhZE9iamVjdCwgQ29yZVJlc3BvbnNlLCBDb3JlVXBkYXRlT2JqZWN0LCBTbmFja2JhckNvcmVGZWVkYmFjayB9IGZyb20gJy4vdHlwZXMvdXN3YWdvbi1jb3JlLnR5cGVzJztcbmltcG9ydCB7ICBCZWhhdmlvclN1YmplY3QsIGZpcnN0LCBmaXJzdFZhbHVlRnJvbSB9IGZyb20gJ3J4anMnO1xuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290J1xufSlcbmV4cG9ydCBjbGFzcyBVc3dhZ29uQ29yZVNlcnZpY2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAgLyoqXG4gICAgICogVXBsb2FkIHByb2dyZXNzIGluZGljYXRvciBvbiBjdXJyZW50IGZpbGUgdXBsb2FkXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBnZXRVcGxvYWRQcm9ncmVzcygpe1xuICAgICAqICByZXR1cm4gdGhpcy5BUEkudXBsb2FkUHJvZ3Jlc3M7XG4gICAgICogfVxuICAgICAqICBcbiAgICoqL1xuICBwdWJsaWMgdXBsb2FkUHJvZ3Jlc3M/Om51bWJlcjtcbiAgcHJpdmF0ZSBsb2FkaW5nU3ViamVjdDogQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPihmYWxzZSk7XG4gICAvKipcbiAgICAgKiBHZXQgbG9hZGluZyBzdGF0dXMgb2YgdGhlIEFQSVxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogdGhpcy5BUEkuaXNMb2FkaW5nJC5zdWJzY3JpYmUobG9hZGluZyA9PiB7XG4gICAgICogIHRoaXMubG9hZGluZyA9IGxvYWRpbmc7XG4gICAgICogfSlcbiAgICAgKiAgXG4gICAqKi9cbiAgcHVibGljIGlzTG9hZGluZyQgPSAgdGhpcy5sb2FkaW5nU3ViamVjdC5hc09ic2VydmFibGUoKTtcblxuICBwcml2YXRlIGNvcmVGZWVkYmFjazpTbmFja2JhckNvcmVGZWVkYmFja1tdID0gW107XG4gIHByaXZhdGUgcHVibGljRm9ybTpDb3JlRm9ybSA9IHt9XG4gICAvKipcbiAgICAgKiBTZWN1cmUgZm9ybSBmb3Igc3RvcmluZyBtb3JlIHNlY3VyZSBpbnB1dFxuICAgICAqIFxuICAgICAqIE5PVEU6IFRoaXMgaXMgdGhlIGZvcm0gdGhhdCBzaG91bGQgYmUgdXNlZCB3aGVuIGJ1aWxkaW5nIHBvc3RPYmplY3RzXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBmb3IobGV0IGtleSBpbiB0aGlzLkFQSS5jb3JlRm9ybSl7XG4gICAgICogIC8vIHByb2Nlc3MgdmFsdWVcbiAgICAgKiAgY29uc29sZS5sb2codGhpcy5BUEkuY29yZUZvcm1ba2V5XSk7XG4gICAgICogfVxuICAgICAqIFxuICAgKiovXG4gIHB1YmxpYyBjb3JlRm9ybTpDb3JlRm9ybSA9IHt9XG4gIHByaXZhdGUgc29ja2V0PzogV2ViU29ja2V0O1xuICBwcml2YXRlIGNvbmZpZz86IENvcmVDb25maWc7XG4gIHByaXZhdGUgdGltZW91dDphbnk7XG4gIHByaXZhdGUgbGl2ZUV2ZW50czp7W2tleTogc3RyaW5nXTogKG1lc3NhZ2U6IE1lc3NhZ2VFdmVudCkgPT4gdm9pZCB9ID0ge307XG4gIHByaXZhdGUgbG9hZGVyRGVsYXk6bnVtYmVyID0gMzAwMDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcbiAgKSB7IH1cblxuICAvLyBJTklUSUFMSVpBVElPTlxuICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgc2VydmljZSBmb3IgdGhlIHByb2plY3RcbiAgICAgKiBAcGFyYW0gY29uZmlnIC0gY29uZmlndXJhdGlvbiB0aGF0IHBvaW50cyB0aGUgc2VydmljZSB0byBpdHMgYXBwcm9wcmlhdGUgc2VydmVyXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0aGlzLkFQSS5pbml0aWFsaXplKHtcbiAgICAgKiAgYXBpOmVudmlyb25tZW50LmFwaSxcbiAgICAgKiAgYXBpS2V5OiBlbnZpcm9ubWVudC5hcGlLZXksXG4gICAgICogIG5vZGVzZXJ2ZXI6IGVudmlyb25tZW50Lm5vZGVzZXJ2ZXIsXG4gICAgICogIHNlcnZlcjogZW52aXJvbm1lbnQuc2VydmVyLFxuICAgICAqICBzb2NrZXQ6IGVudmlyb25tZW50LnNvY2tldFxuICAgICAqIH0pXG4gICAgICogXG4gICAqKi9cbiAgaW5pdGlhbGl6ZShjb25maWc6Q29yZUNvbmZpZyl7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgaWYodGhpcy5jb25maWcubG9hZGVyRGVsYXkgIT0gdW5kZWZpbmVkKXtcbiAgICAgIHRoaXMubG9hZGVyRGVsYXkgPSB0aGlzLmNvbmZpZy5sb2FkZXJEZWxheTtcbiAgICB9XG4gICAgdGhpcy5jb25uZWN0VG9Tb2NrZXQoY29uZmlnKTtcbiAgfVxuXG4gIHByaXZhdGUgY29ubmVjdFRvU29ja2V0KGNvbmZpZzpDb3JlQ29uZmlnKXtcbiAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoY29uZmlnLnNvY2tldCk7XG4gICAgdGhpcy5zb2NrZXQuYmluYXJ5VHlwZSA9ICdhcnJheWJ1ZmZlcic7XG4gICAgdGhpcy5zb2NrZXQhLm9ubWVzc2FnZSA9IChtZXNzYWdlKT0+e1xuICAgICAgdmFyIGRlY29kZWRNZXNzYWdlID0gbmV3IFRleHREZWNvZGVyKCd1dGYtOCcpLmRlY29kZShtZXNzYWdlLmRhdGEpO1xuICAgICAgY29uc3Qgc29ja2V0RGF0YSA9IEpTT04ucGFyc2UoZGVjb2RlZE1lc3NhZ2UpO1xuICAgICAgaWYoc29ja2V0RGF0YS5hcHAgIT0gY29uZmlnLmFwcCkgcmV0dXJuO1xuICAgICAgZm9yIChjb25zdCBpZCBpbiB0aGlzLmxpdmVFdmVudHMpIHtcbiAgICAgICAgICB0aGlzLmxpdmVFdmVudHNbaWRdKHNvY2tldERhdGEuZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuc29ja2V0Lm9uY2xvc2UgPSAoKT0+e1xuICAgICAgY29uc29sZS5sb2coJ1JlY29ubmVjdGluZyB0byBzb2NrZXQuLi4nKTtcbiAgICAgIHRoaXMuY29ubmVjdFRvU29ja2V0KGNvbmZpZyk7XG4gICAgfVxuICB9XG5cbiAgIC8qKlxuICAgICAqIEFkZCBhIG5ldyBsaXZlIGxpc3RlbmVyIGZyb20gdGhlIHNlcnZlcidzIHdlYnNvY2tldFxuICAgICAqIFxuICAgICAqIEBwYXJhbSBpZCAtIFVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGUgbGlzdGVuZXJzIHRvIGF2b2lkIGNvbGxpc2lvbnNcbiAgICAgKiBAcGFyYW0gaGFuZGxlciAtIFdlYnNvY2tldCBtZXNzYWdlcyBhcmUgcGFzc2VkIHRvIHRoaXMgaGFuZGxlclxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0aGlzLkFQSS5hZGRMaXZlTGlzdGVuZXIoJ2V2ZW50LTEnLChtZXNzYWdlKT0+e1xuICAgICAqICBPVVRQVVQ6XG4gICAgICogIC8vIHNhbWUgYXMgdGhlIGpzb24gc2VudCBmcm9tIHNvY2tldFNlbmQoZGF0YSlcbiAgICAgKiAgLy8gbG9naWNzIGFyZSBhcHBsaWVkIGhlcmUgc28gdGhhdCBtZXNzYWdlcyBhcmUgb25seSByZWNlaXZlZCBvbiBzcGVjaWZpYyBjbGllbnRzXG4gICAgICogIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgICAqIH0pXG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgYWRkU29ja2V0TGlzdGVuZXIoIGlkOnN0cmluZyxoYW5kbGVyOihtZXNzYWdlOiBhbnkpPT52b2lkKSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIHRoaXMubGl2ZUV2ZW50c1tpZF09IGhhbmRsZXI7XG4gIH1cbiAgLyoqXG4gICAgICogR2V0IGxpc3Qgb2YgbGl2ZSBsaXN0ZW5lcnMgaW4gdGhlIHByb2plY3RcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdGhpcy5BUEkuZ2V0TGlzdGVuZXJzKCk7XG4gICAgICogXG4gICAgICogT1VUUFVUOiBBbiBhbGVydCBzaG93aW5nIGxpc3Qgb2YgbGlzdGVuZXJzXG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgZ2V0TGlzdGVuZXJzKCkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICBhbGVydChKU09OLnN0cmluZ2lmeShPYmplY3Qua2V5cyh0aGlzLmxpdmVFdmVudHMpKSk7XG4gIH1cbiAgLyoqXG4gICAgICogU2VuZHMgYSBtZXNzYWdlIHRvIHRoZSB3ZWJzb2NrZXRcbiAgICAgKiBAcGFyYW0gZGF0YSAtIEEganNvbiBvYmplY3QgbWVzc2FnZVxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0aGlzLkFQSS5zb2NrZXRTZW5kKHtcbiAgICAgKiAgICB0bzogc3R1ZGVudC5pZCxcbiAgICAgKiAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAqIH0pXG4gICAgICogXG4gICAgICogXG4gICAqKi9cbiAgc29ja2V0U2VuZChkYXRhOiBvYmplY3QpIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICBcbiAgICB0aGlzLnNvY2tldCEuc2VuZChcbiAgICAgIEpTT04uc3RyaW5naWZ5KHsga2V5OiB0aGlzLmNvbmZpZz8uYXBpS2V5LCBhcHA6IHRoaXMuY29uZmlnPy5hcHAsIGRhdGE6IGRhdGEgfSlcbiAgICApO1xuICBcbiAgfVxuICBcbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5zb2NrZXQ/LmNsb3NlKCk7XG4gIH1cblxuICBwcml2YXRlIHBnRXNjYXBlU3RyaW5nKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh0eXBlb2YgaW5wdXQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0lucHV0IG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICB9IFxuICAgIC8vIEVzY2FwZSBzaW5nbGUgcXVvdGVzIGJ5IHJlcGxhY2luZyB0aGVtIHdpdGggdHdvIHNpbmdsZSBxdW90ZXNcbiAgICByZXR1cm4gaW5wdXQucmVwbGFjZSgvJy9nLCBcIicnXCIpLnRyaW0oKTtcbiAgfVxuXG4gIC8qKlxuICAgICAqIEJ1aWxkcyBhIENvcmVGb3JtIGZyb20gdXNlciBpbnB1dFxuICAgICAqXG4gICAgICogQHBhcmFtIGtleSAtIEEgc3RyaW5nIHJlZmVyZW5jZSB0byBmb3JtIGtleVxuICAgICAqIEBwYXJhbSB2YWx1ZSAtIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgYSBmb3JtIGtleVxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogXG4gICAgICogaGFuZGxlSW5wdXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpe1xuICAgICAqICB0aGlzLkFQSS5oYW5kbGVGb3JtVmFsdWUoJ2VtYWlsJywgZXZlbnQudGFyZ2V0LnZhbHVlKTsgLy8ga2V5IHNob3VsZCBiZSBpbml0aWFsaXplZCB1c2luZyBpbml0aWFsaXplRm9ybSgpXG4gICAgICogfVxuICAgICAqIFxuICAgICAqIE9VVFBVVDpcbiAgICAgKiA8aW5wdXQgKGNoYW5nZSk9J2hhbmRsZUlucHV0KFwiZW1haWxcIiwgJGV2ZW50KScgPiBcbiAgICAgKlxuICAgICAqIFxuICAgICAqIFxuICAgKiovXG4gIGhhbmRsZUZvcm1WYWx1ZShrZXk6c3RyaW5nLCB2YWx1ZTpzdHJpbmcpe1xuICAgIHRoaXMucHVibGljRm9ybVtrZXldID0gdmFsdWU7IFxuICAgIHRoaXMuY29yZUZvcm1ba2V5XSA9IHRoaXMucGdFc2NhcGVTdHJpbmcodmFsdWUpO1xuICB9XG4gICAvKipcbiAgICAgKiBCdWlsZHMgYSBDb3JlRm9ybSBmcm9tIHVzZXIgaW5wdXRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXkgLSBBIHN0cmluZyByZWZlcmVuY2UgdG8gZm9ybSBrZXlcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFxuICAgICAqIGdldElucHV0KGtleTpzdHJpbmcpe1xuICAgICAqICByZXR1cm4gdGhpcy5BUEkuZ2V0Rm9ybVZhbHVlKGtleSk7XG4gICAgICogfVxuICAgICAqIFxuICAgICAqIE9VVFBVVDpcbiAgICAgKiA8ZGl2Pnt7Z2V0SW5wdXQoJ2VtYWlsJyl9fTwvZGl2PlxuICAgICAqIFxuICAgKiovXG4gICBnZXRGb3JtVmFsdWUoa2V5OnN0cmluZyl7XG4gICAgaWYodGhpcy5wdWJsaWNGb3JtW2tleV0gPT09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnUGxlYXNlIGluaXRpYWxpemUgdGhlIGZvcm0gdXNpbmcgaW5pdGlhbGl6ZUZvcm0oWy4uLmZpZWxkc10pJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnB1YmxpY0Zvcm1ba2V5XTtcbiAgfVxuXG4gIC8qKlxuICAgICAqIEluaXRpYWxpemUgYSBDb3JlRm9ybVxuICAgICAqXG4gICAgICogQHBhcmFtIGtleXMgLSBBIGxpc3Qgb2Ygc3RyaW5ncyByZXByZXNlbnRpbmcgZm9ybSBrZXlzXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0aGlzLkFQSS5pbml0aWFsaXplRm9ybShbJ2VtYWlsJ10pO1xuICAgICAqICBcbiAgICAgKiBPVVRQVVQ6XG4gICAgICogY29uc29sZS5sb2codGhpcy5BUEkuY29yZUZvcm0pOyBcbiAgICAgKiBcbiAgICAgKiBcbiAgICoqL1xuICBpbml0aWFsaXplRm9ybShrZXlzOnN0cmluZ1tdKXtcbiAgICB0aGlzLnB1YmxpY0Zvcm0gPSBrZXlzLnJlZHVjZSgocHJldjphbnksY3VycjphbnkpPT57XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihwcmV2LCB7W2N1cnJdOicnfSlcbiAgICB9LHt9KVxuICAgIHRoaXMuY29yZUZvcm0gPSBrZXlzLnJlZHVjZSgocHJldjphbnksY3VycjphbnkpPT57XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihwcmV2LCB7W2N1cnJdOicnfSlcbiAgICB9LHt9KVxuICB9XG5cbiAgLy8gVVRJTElUSUVTXG4gIHByaXZhdGUgbG9hZGluZ1RpbWVvdXQ6YW55O1xuICAvKipcbiAgICAgKiBNYXJrIHRoZSBzdGF0dXMgb2YgdGhlIEFQSSBhcyBsb2FkaW5nXG4gICAgICpcbiAgICAgKiBAcGFyYW0gaXNMb2FkaW5nIC0gQSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgQVBJIGlzIGxvYWRpbmdcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFxuICAgICAqIHRoaXMuQVBJLnNldExvYWRpbmcodHJ1ZSlcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyh0aGlzLkFQSS5pc0xvYWRpbmcpO1xuICAgICAqIFxuICAgKiovXG4gIHNldExvYWRpbmcoaXNMb2FkaW5nOmJvb2xlYW4pe1xuICAgIGlmKHRoaXMubG9hZGluZ1RpbWVvdXQpe1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMubG9hZGluZ1RpbWVvdXQpO1xuICAgIH1cbiAgICBpZighaXNMb2FkaW5nKXtcbiAgICAgIHRoaXMubG9hZGluZ1RpbWVvdXQgPSAgc2V0VGltZW91dCgoKT0+e1xuICAgICAgICB0aGlzLmxvYWRpbmdTdWJqZWN0Lm5leHQoaXNMb2FkaW5nKTtcbiAgICAgIH0sIHRoaXMubG9hZGVyRGVsYXkpXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLmxvYWRpbmdTdWJqZWN0Lm5leHQoaXNMb2FkaW5nKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICAgKiBDcmVhdGVzIGEgaGFzaCBmcm9tIHRoZSBzZXJ2ZXIgZm9yIGVuY3J5cHRpbmcgZGF0YVxuICAgICAqXG4gICAgICogQHBhcmFtIHR5cGUgLSBhIHR5cGUgb2YgZmVlZGJhY2sgbWVzc2FnZSB0byBzZW5kXG4gICAgICogXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgLSBhIHN0cmluZyBjb250YWluaW5nIHRoZSBtZXNzYWdlIHRvIHNlbmRcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gdGltZXIgLSBhIG51bWJlciByZXByZXNlbnRpbmcgdGhlIGRlbGF5IGZvciB0aGUgZmVlZGJhY2sgdG8gY2xvc2VcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFxuICAgICAqIHRoaXMuQVBJLnNlbmRGZWVkYmFjaygnc3VjY2VzcycsICdQdXNoZWQgZGF0YSEnLCA1MDAwKVxuICAgICAqIFxuICAgKiovXG4gICAgc2VuZEZlZWRiYWNrKHR5cGU6J3N1Y2Nlc3MnfCdlcnJvcid8J25ldXRyYWwnfCd3YXJuaW5nJyxtZXNzYWdlOnN0cmluZywgdGltZXI/Om51bWJlcil7XG4gICAgICBpZih0aGlzLmNvcmVGZWVkYmFjay5sZW5ndGggPj0gMyl7XG4gICAgICAgIHRoaXMuY29yZUZlZWRiYWNrLnNwbGljZSgwLCAxKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY29uc3QgZmVlZGJhY2sgPSB7XG4gICAgICAgIGlkOiB0aGlzLmNyZWF0ZVVuaXF1ZUlEMzIoKSxcbiAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgIH0gYXMgU25hY2tiYXJDb3JlRmVlZGJhY2s7XG4gICAgICBcbiAgICAgIGlmICh0aW1lciAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gU2V0IGEgdGltZXIgdG8gcmVzZXQgdGhlIHNuYWNrYmFyIGZlZWRiYWNrIGFmdGVyIDIgc2Vjb25kc1xuICAgICAgICBmZWVkYmFjay50aW1lb3V0ID0gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIC8vIHRoaXMuY29yZUZlZWRiYWNrW2luZGV4XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuY29yZUZlZWRiYWNrLmZpbmRJbmRleChmZWVkYmFjayA9PiBmZWVkYmFjay5pZD09IGZlZWRiYWNrLmlkKTtcbiAgICAgICAgICBpZihpbmRleCA+PSAwKXtcbiAgICAgICAgICAgIHRoaXMuY29yZUZlZWRiYWNrLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0aW1lcik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY29yZUZlZWRiYWNrLnB1c2goZmVlZGJhY2spICAgICAgXG4gICAgfVxuICAvKipcbiAgICAgKiBDbG9zZXMgYSBmZWVkYmFja1xuICAgICAqXG4gICAgICogQHBhcmFtIGluZGV4IC0gQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBpbmRleCBvZiBmZWVkYmFjayB0byBjbG9zZVxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogXG4gICAgICogdGhpcy5BUEkuc2VuZEZlZWRiYWNrKCdzdWNjZXNzJywgJ1B1c2hlZCBkYXRhIScpXG4gICAgICogXG4gICAqKi9cbiAgY2xvc2VGZWVkYmFjayhpbmRleDpudW1iZXIpe1xuICAgIGNsZWFyVGltZW91dCh0aGlzLmNvcmVGZWVkYmFja1tpbmRleF0udGltZW91dCk7XG4gICAgdGhpcy5jb3JlRmVlZGJhY2suc3BsaWNlKGluZGV4LCAxKTtcbiAgfVxuICAvKipcbiAgICAgKiBTdG9yZSBBUEkgZmVlZGJhY2sgZm9yIHNuYWNrYmFycyBhbmQgb3RoZXIgZGlzcGxheSBmZWVkYmFja1xuICAgICAqIFxuICAgICAqIEByZXR1cm5zIC0gQSBsaXN0IG9mIGZlZWRiYWNrIG9iamVjdHMgd2l0aCB7dHlwZSwgbWVzc2FnZX1cbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFxuICAgICAqIGdldEZlZWRiYWNrcygpe1xuICAgICAqICAgcmV0dXJuIHRoaXMuQVBJLmdldEZlZWRiYWNrcygpO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBPVVRQVVQ6XG4gICAgICogIC8vIFNuYWNrYmFycyBpbiBhcHAuY29tcG9uZW50LnRzIChyb290KVxuICAgICAqICA8ZGl2IGNsYXNzPSdzbmFja2JhcicgKm5nRm9yPSdsZXQgZmVlZGJhY2sgb2YgZ2V0RmVlZGJhY2tzKCknPiB7e2ZlZWRiYWNrLm1lc3NhZ2V9fSA8L2Rpdj5cbiAgICAgKiBcbiAgICAgKiBcbiAgICoqL1xuICAgIGdldEZlZWRiYWNrcygpe1xuICAgICAgcmV0dXJuIHRoaXMuY29yZUZlZWRiYWNrO1xuICAgIH1cbiAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBoYXNoIGZyb20gdGhlIHNlcnZlciBmb3Igbm9uIGRlY3J5cHRhYmxlIGRhdGFcbiAgICAgKlxuICAgICAqIEBwYXJhbSB0ZXh0IC0gQSBzdHJpbmcgdG8gZW5jcnlwdFxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIEEgc3RyaW5nIGhhc2ggb3IgdGhyb3dzIGFuIGVycm9yIGlmIGFuIGVycm9yIGhhcyBvY2N1cmVkXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGhhc2ggPSB0aGlzLkFQSS5oYXNoKCdrZW4nKTtcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyhoYXNoKTtcbiAgICAgKiBcbiAgICoqL1xuICBhc3luYyBoYXNoKHRleHQ6c3RyaW5nKXtcbiAgICBjb25zdCByZXNwb25zZSA9ICBhd2FpdCB0aGlzLnBvc3QoJ2dldF9oYXNoJywge3RleHQ6IHRleHR9KVxuICAgIGlmKHJlc3BvbnNlLnN1Y2Nlc3Mpe1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm91dHB1dDtcbiAgICB9ZWxzZXtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2VydmVyIEVycm9yJyk7XG5cbiAgICB9XG4gIH1cbiAgIC8qKlxuICAgICAqIEVuY3J5cHRzIGEgdGV4dCBcbiAgICAgKlxuICAgICAqIEBwYXJhbSB0ZXh0IC0gQSBzdHJpbmcgdG8gZW5jcnlwdFxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIEEgc3RyaW5nIGFuIGVuY3J5cHRlZCB0ZXh0IG9yIHRocm93cyBhbiBlcnJvciBpZiBhbiBlcnJvciBoYXMgb2NjdXJlZFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBlbmNyeXB0ZWQgPSB0aGlzLkFQSS5lbmNyeXB0KCdrZW4nKTtcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyhlbmNyeXB0ZWQpO1xuICAgICAqIFxuICAgKiovXG4gICBhc3luYyBlbmNyeXB0KHRleHQ6c3RyaW5nKXtcbiAgICBjb25zdCByZXNwb25zZSA9ICBhd2FpdCB0aGlzLnBvc3QoJ2VuY3J5cHQnLCB7dGV4dDogdGV4dH0pXG4gICAgaWYocmVzcG9uc2Uuc3VjY2Vzcyl7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub3V0cHV0O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXJ2ZXIgRXJyb3InKTtcblxuICAgIH1cbiAgfVxuICAgLyoqXG4gICAgICogRGVjcnlwdCBhbiBlbmNyeXB0ZWQgdGV4dCBpbiB0aGUgc2VydmVyIHRvIGdldCBwbGFpbiB0ZXh0XG4gICAgICpcbiAgICAgKiBAcGFyYW0gZW5jcnlwdGVkIC0gQSBzdHJpbmcgdG8gZW5jcnlwdFxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIEEgc3RyaW5nIHRoZSBwbGFpbiB0ZXh0IG9mIGFuIGVuY3J5cHRlZCB0ZXh0IG9yIG9yIHRocm93cyBhbiBlcnJvciBpZiBhbiBlcnJvciBoYXMgb2NjdXJlZFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBwbGFpblRleHQgPSB0aGlzLkFQSS5kZWNyeXB0KCdBc2kxMmlVU0lEVUFJU0RVMTInKTtcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyhwbGFpblRleHQpO1xuICAgICAqIFxuICAgKiovXG4gICBhc3luYyBkZWNyeXB0KGVuY3J5cHRlZDpzdHJpbmcpe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gIGF3YWl0IHRoaXMucG9zdCgnZGVjcnlwdCcsIHtlbmNyeXB0ZWQ6IGVuY3J5cHRlZH0pXG4gICAgaWYocmVzcG9uc2Uuc3VjY2Vzcyl7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub3V0cHV0O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXJ2ZXIgRXJyb3InKTtcbiAgICB9XG4gIH1cbiAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBhIHZhbHVlIG1hdGNoZXMgYSBoYXNoXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGV4dCAtIEEgc3RyaW5nIHRvIGNoZWNrXG4gICAgICogXG4gICAgICogQHBhcmFtIGhhc2ggLSBBIGhhc2ggc3RyaW5nIHRvIGNoZWNrXG4gICAgICogXG4gICAgICogQHJldHVybnMgLSBUcnVlIGlmIHRleHQgYW5kIGhhc2ggbWF0Y2hlcywgZmFsc2Ugb3RoZXJ3aXNlLiBUaHJvd3MgYW4gZXJyb3IgaWYgYW4gZXJyb3IgaGFzIG9jY3VycmVkLlxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBtYXRjaCA9IHRoaXMuQVBJLnZlcmlmeUhhc2goJ3RleHQnLCckMmFhc2RrazIuMTIzaTEyM2lqYXN1ZGZrbGFqc2RsYScpO1xuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKG1hdGNoKTtcbiAgICAgKiBcbiAgICoqL1xuICAgYXN5bmMgdmVyaWZ5SGFzaCh0ZXh0OnN0cmluZyxoYXNoOnN0cmluZyl7XG4gICAgY29uc3QgcmVzcG9uc2UgPSAgYXdhaXQgdGhpcy5wb3N0KCd2ZXJpZnlfaGFzaCcsIHt0ZXh0OiB0ZXh0LCBoYXNoOmhhc2h9KVxuICAgIGlmKHJlc3BvbnNlLnN1Y2Nlc3Mpe1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm91dHB1dDtcbiAgICB9ZWxzZXtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2VydmVyIEVycm9yJyk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgICAqIENyZWF0ZXMgYSB1bmlxdWUgaWRlbnRpZmllciB3aXRoIHRoZSBsZW5ndGggb2YgMzJcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgcmFuZG9tIHVuaXF1ZSAzMiBzdHJpbmcgaWRlbnRpZmllclxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBpZCA9IHRoaXMuQVBJLmNyZWF0ZVVuaXF1ZUlEMzIoKTtcbiAgICAgKiBcbiAgICAgKiBcbiAgICoqL1xuICBjcmVhdGVVbmlxdWVJRDMyKCkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICBjb25zdCB0aW1lc3RhbXAgPSBEYXRlLm5vdygpLnRvU3RyaW5nKDE2KTsgLy8gR2V0IGN1cnJlbnQgdGltZSBpbiBoZXhcbiAgICAgIGNvbnN0IHJhbmRvbVBhcnQgPSAneHh4eHh4eHh4eHh4eHh4eCcucmVwbGFjZSgveC9nLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogMTYgfCAwKS50b1N0cmluZygxNik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aW1lc3RhbXAgKyByYW5kb21QYXJ0LnNsaWNlKDAsIDE2KTsgLy8gQ29tYmluZSB0aW1lc3RhbXAgd2l0aCByYW5kb20gcGFydFxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBlbmNyeXB0UmVxdWVzdChwbGFpbnRleHQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qga2V5U3RyaW5nID0gJ0FIUzg1NzY1OThQSU9VTkEyMTQ4NDI3ODAzMDltcHFiSCc7XG4gICAgY29uc3Qga2V5ID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKGtleVN0cmluZy5zbGljZSgwLCAzMikpOyAvLyBVc2Ugb25seSB0aGUgZmlyc3QgMzIgY2hhcmFjdGVycyBmb3IgQUVTLTI1NlxuICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheSgxNikpOyAvLyBHZW5lcmF0ZSByYW5kb20gSVYgKDE2IGJ5dGVzIGZvciBBRVMpXG5cbiAgICAvLyBJbXBvcnQgdGhlIGtleVxuICAgIGNvbnN0IGNyeXB0b0tleSA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgJ3JhdycsXG4gICAgICBrZXksXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJyB9LFxuICAgICAgZmFsc2UsXG4gICAgICBbJ2VuY3J5cHQnXVxuICAgICk7XG5cbiAgICAvLyBFbmNyeXB0IHRoZSBwbGFpbnRleHRcbiAgICBjb25zdCBlbmNvZGVkUGxhaW50ZXh0ID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHBsYWludGV4dCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgIHsgbmFtZTogJ0FFUy1DQkMnLCBpdjogaXYgfSxcbiAgICAgIGNyeXB0b0tleSxcbiAgICAgIGVuY29kZWRQbGFpbnRleHRcbiAgICApO1xuXG4gICAgLy8gQ29tYmluZSBJViBhbmQgY2lwaGVydGV4dCwgdGhlbiBlbmNvZGUgdG8gYmFzZTY0XG4gICAgY29uc3QgY29tYmluZWQgPSBuZXcgVWludDhBcnJheShpdi5ieXRlTGVuZ3RoICsgY2lwaGVydGV4dC5ieXRlTGVuZ3RoKTtcbiAgICBjb21iaW5lZC5zZXQoaXYsIDApO1xuICAgIGNvbWJpbmVkLnNldChuZXcgVWludDhBcnJheShjaXBoZXJ0ZXh0KSwgaXYuYnl0ZUxlbmd0aCk7XG5cbiAgICAvLyBDb252ZXJ0IHRvIGJhc2U2NFxuICAgIHJldHVybiBidG9hKFN0cmluZy5mcm9tQ2hhckNvZGUoLi4uY29tYmluZWQpKTtcbiAgfVxuXG4gIGFzeW5jIHBvc3QobWV0aG9kOiBzdHJpbmcsIGJvZHk6IHt9KSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIGZvciAodmFyIFtrZXksIG9ial0gb2YgT2JqZWN0LmVudHJpZXM8YW55Pihib2R5KSkge1xuICAgICAgaWYgKGtleSA9PSAndmFsdWVzJykge1xuICAgICAgICBmb3IgKHZhciBbZmllbGQsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgICAgICAgaWYodmFsdWUgPT0gbnVsbCB8fCB2YWx1ZSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBvYmpbZmllbGRdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKHtcbiAgICAgICdYLVJlcXVlc3RlZC1XaXRoJzogJ1hNTEh0dHBSZXF1ZXN0JyxcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfSk7XG4gICAgY29uc3Qgc2FsdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIGNvbnN0IGpzb25TdHJpbmcgPSBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICB7XG4gICAgICAgICAgICBBUElfS0VZOiB0aGlzLmNvbmZpZz8uYXBpS2V5LFxuICAgICAgICAgICAgQXBwOiB0aGlzLmNvbmZpZz8uYXBwLFxuICAgICAgICAgICAgTWV0aG9kOiBtZXRob2QsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBib2R5XG4gICAgICAgIClcbiAgICAgICk7XG5cbiAgICBjb25zdCBlbmNyeXB0ZWQgPSBhd2FpdCB0aGlzLmVuY3J5cHRSZXF1ZXN0KGpzb25TdHJpbmcpO1xuICAgIHJldHVybiBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLmh0dHAucG9zdDxhbnk+KFxuICAgICAgdGhpcy5jb25maWc/LmFwaSArICc/JyArIHNhbHQsXG4gICAgICBlbmNyeXB0ZWQsXG4gICAgICB7IGhlYWRlcnMgfVxuICAgICkpO1xuICB9XG5cbiAgXG4gIC8vIENSRUFURSBSRUFEIFVQREFURSBBTkQgREVMRVRFIEhBTkRMRVJTXG5cbiAgLyoqXG4gICAgICogUnVucyBhbiBpbnNlcnQgcXVlcnkgdG8gdGhlIHNlcnZlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwb3N0T2JqZWN0IC0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGFibGVzLCBhbmQgdmFsdWVzIGZvciB0aGUgU1FMIHF1ZXJ5LlxuICAgICAqIEByZXR1cm5zIEEgcmVzcG9zZSBvYmplY3QgXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGRldGFpbHMucGFzc3dvcmQgPSB0aGlzLkFQSS5oYXNoKGRldGFpbHMucGFzc3dvcmQpO1xuICAgICAqIFxuICAgICAqIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLkFQSS5jcmVhdGUoe1xuICAgICAqICAgdGFibGVzOiAnYWRtaW4nLFxuICAgICAqICAgdmFsdWVzOiB7XG4gICAgICogICAgJ2VtYWlsJzp0aGlzLkFQSS5jb3JlRm9ybVsnZW1haWwnXSxcbiAgICAgKiAgICAncGFzc3dvcmQnOiB0aGlzLkFQSS5jb3JlRm9ybVsncGFzc3dvcmQnXSwgXG4gICAgICogIH0sXG4gICAgICogfSk7XG4gICAgICogXG4gICAgICogaWYoZGF0YS5zdWNjZXNzKXtcbiAgICAgKiAgY29uc29sZS5sb2coZGF0YS5vdXRwdXQpO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICoqL1xuICBhc3luYyBjcmVhdGUocG9zdE9iamVjdDpDb3JlQ3JlYXRlT2JqZWN0KTpQcm9taXNlPENvcmVSZXNwb25zZT57XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIHJldHVybiAgYXdhaXQgdGhpcy5wb3N0KCdjcmVhdGVfZW50cnknLCB7XG4gICAgICAnZGF0YSc6IEpTT04uc3RyaW5naWZ5KHBvc3RPYmplY3QpLFxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICAgKiBSdW5zIGFuIHJlYWQgcXVlcnkgdG8gdGhlIHNlcnZlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwb3N0T2JqZWN0IC0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgc2VsZWN0b3JzLCB0YWJsZXMsIGFuZCBjb25kaXRpb25zIGZvciB0aGUgU1FMIHF1ZXJ5LlxuICAgICAqIEByZXR1cm5zIEEgcmVzcG9zZSBvYmplY3QgXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLkFQSS5yZWFkKHtcbiAgICAgKiAgIHNlbGVjdG9yczogW1xuICAgICAqICAgICAnZl9hZG1pbi5JRCcsXG4gICAgICogICAgICdVc2VybmFtZScsXG4gICAgICogICAgICdFbWFpbCcsXG4gICAgICogICAgICdDT1VOVChmX21lc3NhZ2VzLklEKSBhcyBpbmJveCdcbiAgICAgKiAgIF0sXG4gICAgICogICB0YWJsZXM6ICdmX2FkbWluJyxcbiAgICAgKiAgIGNvbmRpdGlvbnM6IGBXSEVSRSBlbWFpbCA9ICR7dGhpcy5BUEkuY29yZUZvcm1bJ2VtYWlsJ119YFxuICAgICAqIH0pO1xuICAgICAqIFxuICAgICAqIGlmKGRhdGEuc3VjY2VzcyAmJiBkYXRhLm91dHB1dC5sZW5ndGggPiAwKXtcbiAgICAgKiAvLyBzaW5nbGUgb3V0cHV0XG4gICAgICogIGNvbnNvbGUubG9nKGRhdGEub3V0cHV0WzBdKTtcbiAgICAgKiAvLyBhbGwgb3V0dHB1dFxuICAgICAqICBmb3IobGV0IHJvdyBvZiBkYXRhLm91dHB1dCl7XG4gICAgICogICAgY29uc29sZS5sb2cocm93KTtcbiAgICAgKiAgfVxuICAgICAqIH1cbiAgICAgKiBcbiAgICoqL1xuICBhc3luYyByZWFkKHBvc3RPYmplY3Q6Q29yZVJlYWRPYmplY3QpOlByb21pc2U8Q29yZVJlc3BvbnNlPntcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMucG9zdCgnZ2V0X2VudHJpZXMnLCB7XG4gICAgICAnZGF0YSc6IEpTT04uc3RyaW5naWZ5KHBvc3RPYmplY3QpLFxuICAgIH0pXG4gIH1cbiAgIC8qKlxuICAgICAqIFJ1bnMgYW4gdXBkYXRlIHF1ZXJ5IHRvIHRoZSBzZXJ2ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcG9zdE9iamVjdCAtIEFuIG9iamVjdCBjb250YWluaW5nIHNlbGVjdG9ycywgdmFsdWVzICx0YWJsZXMsIGFuZCBjb25kaXRpb25zIGZvciB0aGUgU1FMIHF1ZXJ5LlxuICAgICAqIEByZXR1cm5zIEEgcmVzcG9zZSBvYmplY3QgXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGVuY3J5cHRlZCA9IHRoaXMuQVBJLmhhc2godGhpcy5BUEkuY29yZUZvcm1bJ3Bhc3N3b3JkJ10pO1xuICAgICAqIFxuICAgICAqIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLkFQSS51cGRhdGUoe1xuICAgICAqICAgdGFibGVzOiAnZl9hZG1pbicsXG4gICAgICogICB2YWx1ZXM6IHtcbiAgICAgKiAgICAnZW1haWwnOnRoaXMuQVBJLmNvcmVGb3JtWydlbWFpbCddLFxuICAgICAqICAgICdwYXNzd29yZCc6IGVuY3J5cHRlZCwgXG4gICAgICogICB9LFxuICAgICAqICAgY29uZGl0aW9uczogYFdIRVJFIGVtYWlsID0gJHt0aGlzLkFQSS5jb3JlRm9ybVsnZW1haWwnXX1gXG4gICAgICogfSk7XG4gICAgICogXG4gICAgICogaWYoZGF0YS5zdWNjZXNzKXtcbiAgICAgKiAgIGNvbnNvbGUubG9nKGRhdGEub3V0cHV0KTtcbiAgICAgKiB9XG4gICAgICogXG4gICAqKi9cbiAgYXN5bmMgdXBkYXRlKHBvc3RPYmplY3Q6Q29yZVVwZGF0ZU9iamVjdCk6UHJvbWlzZTxDb3JlUmVzcG9uc2U+e1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgIHJldHVybiBhd2FpdCB0aGlzLnBvc3QoJ3VwZGF0ZV9lbnRyeScsIHtcbiAgICAnZGF0YSc6IEpTT04uc3RyaW5naWZ5KHBvc3RPYmplY3QpLFxuICB9KVxuICB9XG5cbiAgLyoqXG4gICAgICogUnVucyBhbiBkZWxldGUgcXVlcnkgdG8gdGhlIHNlcnZlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwb3N0T2JqZWN0IC0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGFibGVzLCBhbmQgY29uZGl0aW9ucyBmb3IgdGhlIFNRTCBxdWVyeS5cbiAgICAgKiBAcmV0dXJucyBBIHJlc3Bvc2Ugb2JqZWN0IFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5BUEkuZGVsZXRlKHtcbiAgICAgKiAgIHRhYmxlczogJ2ZfYWRtaW4nLFxuICAgICAqICAgY29uZGl0aW9uczogYFdIRVJFIGVtYWlsID0gJHt0aGlzLkFQSS5jb3JlRm9ybVsnZW1haWwnXX1gXG4gICAgICogfSk7XG4gICAgICogXG4gICAgICogaWYoZGF0YS5zdWNjZXNzKXtcbiAgICAgKiAgIGNvbnNvbGUubG9nKGRhdGEub3V0cHV0KTtcbiAgICAgKiB9XG4gICAgICogXG4gICAqKi9cbiAgYXN5bmMgZGVsZXRlKHBvc3RPYmplY3Q6Q29yZURlbGV0ZU9iamVjdCk6UHJvbWlzZTxDb3JlUmVzcG9uc2U+e1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5wb3N0KCdkZWxldGVfZW50cnknLCB7XG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShwb3N0T2JqZWN0KSxcbiAgICB9KVxuICB9XG5cbiAgLy8gRklMRSBIQU5ETEVSU1xuXG4gICAvKipcbiAgICAgKiBHZXQgY29tcGxldGUgZmlsZSBVUkwgZnJvbSB0aGUgc2VydmVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZmlsZSAtIEEgc3RyaW5nIHRoYXQgcG9pbnRzIHRvIHRoZSBmaWxlLlxuICAgICAqIEByZXR1cm5zIEEgY29tcGxldGUgdXJsIHN0cmluZyBmcm9tIHRoZSBzZXJ2ZXIgXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IHVybCA9IHRoaXMuQVBJLmdldEZpbGVVUkwoJ2ZpbGVzL3Byb2ZpbGUucG5nJyk7XG4gICAgICogXG4gICAgICogT1VUUFVUOlxuICAgICAqICBodHRwczovL2xvY2FsaG9zdDo4MDgwL2ZpbGVzL3Byb2ZpbGUucG5nXG4gICAgICogXG4gICAqKi9cbiAgZ2V0RmlsZVVSTChmaWxlOiBzdHJpbmcpOnN0cmluZ3x1bmRlZmluZWQge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydChcIlBsZWFzZSBpbml0aWFsaXplIHVzd2Fnb24gY29yZSBvbiByb290IGFwcC5jb21wb25lbnQudHNcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChmaWxlKSB7XG4gICAgICBpZiAoZmlsZS5pbmNsdWRlcygnaHR0cDovLycpIHx8IGZpbGUuaW5jbHVkZXMoJ2h0dHBzOi8vJykpIHJldHVybiBmaWxlO1xuICAgICAgcmV0dXJuIHRoaXMuY29uZmlnPy5zZXJ2ZXIgKyBgLyR7dGhpcy5jb25maWcuYXBwfS9gICsgZmlsZSA7XG4gICAgfVxuICAgIHJldHVybiBmaWxlO1xuICB9XG5cbiAgIC8qKlxuICAgICAqIFVwbG9hZHMgYSBmaWxlIHRvIHRoZSBzZXJ2ZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSBmaWxlIC0gQSBGaWxlIHRvIHVwbG9hZFxuICAgICAqIEBwYXJhbSBmaWxlbmFtZSAtIEEgc3RyaW5nIHRoYXQgcG9pbnRzIHRvIHdoZXJlIHRoZSBmaWxlIHRvIGJlIHN0b3JlZCBpbiB0aGUgc2VydmVyXG4gICAgICogQHBhcmFtIGNodW5rU2l6ZSAtIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgbnVtYmVyIG9mIGJ5dGVzIHRvIHVwbG9hZCBwZXIgY2h1bmtcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogXG4gICAgICogZ2V0VXBsb2FkUHJvZ3Jlc3MoKXtcbiAgICAgKiAgcmV0dXJuIHRoaXMuQVBJLnVwbG9hZFByb2dyZXNzXG4gICAgICogfVxuICAgICAqIFxuICAgICAqIGF3YWl0IHRoaXMuQVBJLnVwbG9hZEZpbGUoc29tZWZpbGUsICdmaWxlcy9wcm9maWxlLnBuZycpO1xuICAgICAqIFxuICAgICAqIE9VVFBVVDpcbiAgICAgKiA8ZGl2Pnt7Z2V0VXBsb2FkUHJvZ3Jlc3MoKX19PGRpdj4gLy8gZHluYW1pY2FsbHkgdXBkYXRlcyB0aGUgcHJvZ3Jlc3NcbiAgICoqL1xuICB1cGxvYWRGaWxlKGZpbGU6IEZpbGUsIGZpbGVuYW1lOiBzdHJpbmcsIGNodW5rU2l6ZTogbnVtYmVyID0gMTAyNCAqIDEwMjQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoXCJQbGVhc2UgaW5pdGlhbGl6ZSB1c3dhZ29uIGNvcmUgb24gcm9vdCBhcHAuY29tcG9uZW50LnRzXCIpO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpPT57cmV0dXJuIG51bGx9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHRvdGFsQ2h1bmtzID0gTWF0aC5jZWlsKGZpbGUuc2l6ZSAvIGNodW5rU2l6ZSk7XG4gICAgICBsZXQgdXBsb2FkZWRDaHVua3MgPSAwOyAvLyBUcmFjayB1cGxvYWRlZCBjaHVua3NcblxuICAgICAgY29uc3QgdXBsb2FkQ2h1bmsgPSAoY2h1bmtJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gY2h1bmtJbmRleCAqIGNodW5rU2l6ZTtcbiAgICAgICAgY29uc3QgZW5kID0gTWF0aC5taW4oc3RhcnQgKyBjaHVua1NpemUsIGZpbGUuc2l6ZSk7XG4gICAgICAgIGNvbnN0IGNodW5rID0gZmlsZS5zbGljZShzdGFydCwgZW5kKTtcblxuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICByZWFkZXIub25sb2FkZW5kID0gKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGJhc2U2NFN0cmluZyA9IChyZWFkZXIucmVzdWx0IGFzIHN0cmluZykuc3BsaXQoJywnKVsxXTtcblxuICAgICAgICAgIGNvbnN0ICRzdWIgPSB0aGlzLmh0dHBcbiAgICAgICAgICAgIC5wb3N0KHRoaXMuY29uZmlnPy5ub2Rlc2VydmVyICsgJy9maWxlaGFuZGxlci1wcm9ncmVzcycsIHtcbiAgICAgICAgICAgICAga2V5OiB0aGlzLmNvbmZpZz8uYXBpS2V5LFxuICAgICAgICAgICAgICBhcHA6IHRoaXMuY29uZmlnPy5hcHAsXG4gICAgICAgICAgICAgIG1ldGhvZDogJ2NyZWF0ZV91cmwnLFxuICAgICAgICAgICAgICBjaHVuazogYmFzZTY0U3RyaW5nLFxuICAgICAgICAgICAgICBmaWxlTmFtZTogIGZpbGVuYW1lLFxuICAgICAgICAgICAgICBjaHVua0luZGV4OiBjaHVua0luZGV4LFxuICAgICAgICAgICAgICB0b3RhbENodW5rczogdG90YWxDaHVua3MsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgICAgICAgIG5leHQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICB1cGxvYWRlZENodW5rcysrO1xuICAgICAgICAgICAgICAgIHRoaXMudXBsb2FkUHJvZ3Jlc3MgPSBNYXRoLnJvdW5kKCh1cGxvYWRlZENodW5rcyAvIHRvdGFsQ2h1bmtzKSAqIDEwMCk7XG4gICAgICAgICAgICAgICAgaWYgKGNodW5rSW5kZXggKyAxIDwgdG90YWxDaHVua3MpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFVwbG9hZCBuZXh0IGNodW5rXG4gICAgICAgICAgICAgICAgICB1cGxvYWRDaHVuayhjaHVua0luZGV4ICsgMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGBGaWxlIHVwbG9hZCBjb21wbGV0ZTogJHtmaWxlbmFtZX1gKTtcbiAgICAgICAgICAgICAgICAgIHRoaXMudXBsb2FkUHJvZ3Jlc3MgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAkc3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAgICAgICByZXNvbHZlKCk7IC8vIFJlc29sdmUgdGhlIHByb21pc2Ugd2hlbiB0aGUgdXBsb2FkIGlzIGNvbXBsZXRlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBlcnJvcjogKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICRzdWIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmVycm9yKCdFcnJvciB1cGxvYWRpbmcgY2h1bmsnLCBlcnIpO1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpOyAvLyBSZWplY3QgdGhlIHByb21pc2Ugb24gZXJyb3JcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGNodW5rKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFN0YXJ0IHVwbG9hZGluZyB0aGUgZmlyc3QgY2h1bmtcbiAgICAgIHVwbG9hZENodW5rKDApO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZGlzcG9zZUZpbGUoZmlsZW5hbWU6IHN0cmluZyl7XG4gICAgICBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLmh0dHBcbiAgICAgIC5wb3N0KHRoaXMuY29uZmlnPy5ub2Rlc2VydmVyICsgJy9maWxlaGFuZGxlci1wcm9ncmVzcycsIHtcbiAgICAgICAga2V5OiB0aGlzLmNvbmZpZz8uYXBpS2V5LFxuICAgICAgICBhcHA6IHRoaXMuY29uZmlnPy5hcHAsXG4gICAgICAgIG1ldGhvZDogJ2RlbGV0ZV91cmwnLFxuICAgICAgICBmaWxlTmFtZTogIGZpbGVuYW1lLFxuICAgICAgfSkpXG4gICAgICA7XG4gIH07XG4gIFxufVxuIl19