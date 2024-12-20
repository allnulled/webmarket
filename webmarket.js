(function (factory) {
  const mod = factory();
  if (typeof window !== 'undefined') {
    window["Webmarket"] = mod;
  }
  if (typeof global !== 'undefined') {
    // global["Webmarket"] = mod;
  }
  if (typeof module !== 'undefined') {
    // module.exports = mod;
  }
})(function () {

  class WebmarketBrowser {

    static correctDBName(dbName) {
      return "webmarket." + dbName.replace(/^webmarket\./g, "");
    }

    static create(...args) {
      return new this(...args);
    }

    static open(...args) {
      const wm = this.create(...args);
      return wm.init().then(db => {
        return wm;
      });
    }

    static init(...args) {
      return this.create(...args).init();
    }

    /**
     * Elimina una base de datos entera de la memoria.
     * @param {String} dbName Nombre de la base de datos a eliminar.
     * @returns 
     * @throws Error de la base de datos. 
     */
    static deleteDatabase(dbName) {
      return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(this.correctDBName(dbName));

        request.onsuccess = () => {
          resolve(`Database "${dbName}" deleted successfully.`);
        };

        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    }

    /**
     * Devuelve un array con los nombres de las bases de datos.
     * @returns Promise<Array<String>>
     * @throws Error de la base de datos. 
     */
    static listDatabases() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.databases();

        request.then((databases) => {
          resolve(databases.map(db => db.name).filter(db => db.startsWith("webmarket.")));
        }).catch((error) => {
          reject(error);
        });
      });
    }

    /**
     * Crea una nueva instancia de Webmarket con el nombre de base de datos y store especificados.
     * @param {string} [dbName="webmarket"] El nombre de la base de datos.
     * @param {string} [storeName="webstore"] El nombre del store.
     */
    constructor(dbName = "webmarket") {
      this.dbName = dbName;
      this.storeName = "webstore";
      this.db = null;
    }

    /**
     * Inicializa la base de datos y se asegura de que el store exista.
     */
    async init() {
      if (this.db) return this.db; // Ya está inicializado

      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.constructor.correctDBName(this.dbName), 1); // Usamos versión 1 para evitar conflictos

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName, { keyPath: "id", autoIncrement: true });
          }
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve(this.db);
        };

        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    }

    /**
     * Cambia la base de datos actual sin cambiar el store.
     * @param {string} dbName El nuevo nombre de la base de datos.
     */
    async changeDatabase(dbName) {
      this.dbName = dbName;
      this.db = null; // Al cambiar la base de datos, cerramos la conexión actual
      await this.init(); // Re-inicializamos con la nueva base de datos
    }

    /**
     * Recupera todos los elementos del store.
     * @returns {Promise<any[]>} Una promesa que resuelve con todos los elementos del store.
     */
    async select() {
      const db = await this.init();
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    /**
     * Recupera un elemento del store por su ID.
     * @param {number|string} id El ID del elemento a recuperar.
     * @returns {Promise<any>} Una promesa que resuelve con el elemento encontrado.
     */
    async selectById(id) {
      const db = await this.init();
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    /**
     * Inserta un solo elemento en el store.
     * @param {any} data El dato que se va a insertar.
     * @returns {Promise<any>} Una promesa que resuelve con el ID del elemento insertado.
     */
    async insertOne(data) {
      const db = await this.init();
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      return new Promise((resolve, reject) => {
        const request = store.add({ data });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    /**
     * Inserta múltiples elementos en el store.
     * @param {any[]} items Los elementos que se van a insertar.
     * @returns {Promise<any[]>} Una promesa que resuelve con los resultados de las inserciones.
     */
    async insertMany(items) {
      const db = await this.init();
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const promises = items.map(item => new Promise((resolve, reject) => {
        const request = store.add({ data: item });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }));
      return Promise.all(promises);
    }

    /**
     * Actualiza un elemento existente en el store.
     * @param {number|string} id El ID del elemento a actualizar.
     * @param {any} data Los nuevos datos del elemento.
     * @returns {Promise<any>} Una promesa que resuelve con el resultado de la actualización.
     */
    async updateOne(id, data) {
      const db = await this.init();
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      return new Promise((resolve, reject) => {
        const request = store.put({ id, data });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    /**
     * Elimina un elemento del store por su ID.
     * @param {number|string} id El ID del elemento a eliminar.
     * @returns {Promise<any>} Una promesa que resuelve con el resultado de la eliminación.
     */
    async deleteOne(id) {
      const db = await this.init();
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

  }

  const Webmarket = typeof window !== "undefined" ? WebmarketBrowser : WebmarketNodejs;

  return Webmarket;

});
