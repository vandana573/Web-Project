import { DatePipe } from '@angular/common';
import { Injectable, } from '@angular/core';
import { StorageService } from './storage.service';
@Injectable({
  providedIn: 'root'
})
export class LocalService {

  constructor(private storageService: StorageService, private datePipe: DatePipe) { }

  // Set Value in local storage
  setJsonValue(key: string, value: any) {
    this.storageService.secureStorage.setItem(key, value);
  }

  // Get the json value from local storage
  getJsonValue(key: string) {
    return this.storageService.secureStorage.getItem(key);
  }

  // Clear the local storage
  clearValue(key) {
    return this.storageService.secureStorage.removeItem(key);
  }

  // Remove all keys in local storage
  clearValues() {
    return [
      this.storageService.secureStorage.removeItem('accessToken'),
      this.storageService.secureStorage.removeItem('user'),
    ];
  }
}
