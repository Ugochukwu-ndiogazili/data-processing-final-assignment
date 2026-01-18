import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Builder as XmlBuilder } from 'xml2js';

type SupportedFormat = 'json' | 'xml' | 'csv';

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();
    const format = this.resolveFormat(request);

    return next.handle().pipe(
      map((data) => {
        if (format === 'xml') {
          response.type('application/xml');
          const builder = new XmlBuilder({ rootName: 'response', headless: true });
          return builder.buildObject(data ?? {});
        }

        if (format === 'csv') {
          response.type('text/csv');
          return this.toCsv(data);
        }

        return data;
      }),
    );
  }

  private resolveFormat(request: any): SupportedFormat {
    const queryFormat = String(request.query?.format || '').toLowerCase();
    if (queryFormat === 'xml' || queryFormat === 'csv' || queryFormat === 'json') {
      return queryFormat as SupportedFormat;
    }

    const accept = String(request.headers?.accept || '').toLowerCase();
    if (accept.includes('application/xml') || accept.includes('text/xml')) {
      return 'xml';
    }
    if (accept.includes('text/csv')) {
      return 'csv';
    }

    return 'json';
  }

  private toCsv(data: any): string {
    if (data == null) {
      return '';
    }

    const rows = Array.isArray(data) ? data : [data];
    if (!rows.length || typeof rows[0] !== 'object') {
      return String(rows[0] ?? '');
    }

    const headers: string[] = Array.from(
      rows.reduce((set, row) => {
        Object.keys(row || {}).forEach((key) => set.add(key));
        return set;
      }, new Set<string>()),
    );

    const escapeValue = (value: any) => {
      if (value == null) return '';
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const needsQuotes = /[",\n]/.test(stringValue);
      const escaped = stringValue.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const lines = [
      headers.join(','),
      ...rows.map((row) =>
        headers.map((key: string) => escapeValue((row as Record<string, any>)?.[key])).join(','),
      ),
    ];

    return lines.join('\n');
  }
}
