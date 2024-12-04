import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  homeHighlights() {
    return 'This action returns home highlights';
  }

  userHighlights() {
    return 'This action returns user highlights';
  }
}
