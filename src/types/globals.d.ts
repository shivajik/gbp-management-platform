/**
 * Global type declarations for third-party libraries
 */

declare module 'react-quill' {
  import { Component } from 'react';

  interface ReactQuillProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    theme?: string;
    modules?: any;
    formats?: string[];
    readOnly?: boolean;
    style?: React.CSSProperties;
    className?: string;
  }

  class ReactQuill extends Component<ReactQuillProps> {}
  export default ReactQuill;
}

declare module 'quill' {
  export interface QuillOptionsStatic {
    debug?: string | boolean;
    modules?: any;
    placeholder?: string;
    readOnly?: boolean;
    theme?: string;
    formats?: string[];
    bounds?: HTMLElement | string;
    scrollingContainer?: HTMLElement | string;
    strict?: boolean;
  }

  export class Quill {
    constructor(container: string | Element, options?: QuillOptionsStatic);
    deleteText(index: number, length: number, source?: string): void;
    format(name: string, value: any, source?: string): void;
    formatLine(
      index: number,
      length: number,
      name: string,
      value: any,
      source?: string
    ): void;
    formatText(
      index: number,
      length: number,
      name: string,
      value: any,
      source?: string
    ): void;
    getBounds(index: number, length?: number): any;
    getContents(index?: number, length?: number): any;
    getFormat(index?: number, length?: number): any;
    getIndex(blot: any): number;
    getLength(): number;
    getLine(index: number): any;
    getLines(index?: number, length?: number): any[];
    getModule(name: string): any;
    getSelection(focus?: boolean): any;
    getText(index?: number, length?: number): string;
    hasFocus(): boolean;
    insertEmbed(index: number, type: string, value: any, source?: string): void;
    insertText(index: number, text: string, source?: string): void;
    insertText(
      index: number,
      text: string,
      name: string,
      value: any,
      source?: string
    ): void;
    isEnabled(): boolean;
    off(eventName: string, handler: Function): any;
    on(eventName: string, handler: Function): any;
    once(eventName: string, handler: Function): any;
    pasteHTML(index: number, html: string, source?: string): void;
    pasteHTML(html: string, source?: string): void;
    removeFormat(index: number, length: number, source?: string): void;
    root: HTMLDivElement;
    scroll: any;
    setContents(delta: any, source?: string): void;
    setSelection(index: number, length?: number, source?: string): void;
    setSelection(range: any, source?: string): void;
    setText(text: string, source?: string): void;
    update(source?: string): void;
    updateContents(delta: any, source?: string): void;
  }

  export default Quill;
}

// Extend global Window interface for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      GOOGLE_BUSINESS_PROFILE_API_KEY: string;
      JWT_SECRET: string;
      SMTP_HOST?: string;
      SMTP_PORT?: string;
      SMTP_USER?: string;
      SMTP_PASS?: string;
      FROM_EMAIL?: string;
      CLOUDINARY_CLOUD_NAME?: string;
      CLOUDINARY_API_KEY?: string;
      CLOUDINARY_API_SECRET?: string;
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;
      AWS_BUCKET_NAME?: string;
      AWS_REGION?: string;
      STRIPE_PUBLISHABLE_KEY?: string;
      STRIPE_SECRET_KEY?: string;
      STRIPE_WEBHOOK_SECRET?: string;
      REDIS_URL?: string;
      APP_NAME?: string;
      APP_URL?: string;
      SUPPORT_EMAIL?: string;
      RATE_LIMIT_WINDOW_MS?: string;
      RATE_LIMIT_MAX_REQUESTS?: string;
      GOOGLE_MAPS_API_KEY?: string;
      WEBHOOK_BASE_URL?: string;
      ENABLE_ANALYTICS?: string;
      ENABLE_NOTIFICATIONS?: string;
      ENABLE_TEAM_FEATURES?: string;
      ENABLE_ADVANCED_REPORTING?: string;
      ENABLE_API_ACCESS?: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}
