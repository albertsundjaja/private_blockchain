// how long should a validation window time should be
const validationWindowTime = 300;

class AddressRequest {
    constructor() {
        this.address = "";
        this.requestTimestamp = 0;
    }

    calculateValidationWindow() {
        // calculate validation window time left
        let validationWindow = Math.round((this.requestTimestamp + validationWindowTime) - (Date.now() / 1000));
        if (validationWindow >= 0) {
            return validationWindow;
        } else {
            return -1;
        }
    }
}

class ValidRequest {
    constructor() {
        this.status = {
            address: "",
            requestTimestamp: 0,
            message: "",
            validationWindow: validationWindowTime,
            messageSignature: true
        }
    }

    calculateValidationWindow() {
        // calculate validation window time left
        let validationWindow = Math.round((this.status.requestTimestamp + validationWindowTime) - (Date.now() / 1000));
        if (validationWindow >= 0) {
            return validationWindow;
        } else {
            return -1;
        }
    }
}

class MemPool {
    constructor() {
        this.pool = [];
        this.validPool = [];
    }

    getRequest(address) {
        // return the address and timestamp of unvalidated pool

        let req = this.pool.find((reqItem) => reqItem.address === address);
        return req;
    }

    deleteRequest(address) {
        // delete the address request of unvalidated pool

        let idx = this.pool.findIndex((reqItem) => reqItem.address === address);
        this.pool.splice(idx, 1);
    }

    getValidRequest(address) {
        // get the request in validated pool
        let req = this.validPool.find((reqItem) => reqItem.status.address === address);
        return req;
    }

    deleteValidRequest(address) {
        // delete the request address in the validated pool

        let idx = this.validPool.findIndex((reqItem) => reqItem.status.address === address);
        this.validPool.splice(idx, 1);
    }

}

module.exports = {
    VALIDATION_TIME: validationWindowTime,
    MemPool: MemPool,
    AddressRequest: AddressRequest,
    ValidRequest: ValidRequest
};