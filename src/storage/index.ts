// Хадгалалтын давхарга.
// Одоогоор LocalStorageStore ашиглаж байна.
// SharePoint Lists-д шилжихдээ энэ файлд SharePointStore-ийг import хийж
// store-ийн утгыг солиход л хангалттай — компонент болон hook-д өөрчлөлт хийхгүй.
export type { IStorage } from './types';
export { LocalStorageStore } from './localStorageStore';

import { LocalStorageStore } from './localStorageStore';
export const store = new LocalStorageStore();
