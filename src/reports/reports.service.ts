import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  homeHighlights() {
    return 'This action returns home highlights';
  }

  userHighlights(ref: number) {
    return `This action returns user highlights for user with reference code ${ref}`;
  }

  dailyReportForUser(ref: number) {
    return `This action returns daily report for user with reference code ${ref}`;
  }

  salesReportForUser(ref: number) {
    return `This action returns sales report for user with reference code ${ref}`;
  }
}
