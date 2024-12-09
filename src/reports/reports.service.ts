import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {

  async homeHighlights() {
    return 'This action returns home highlights';
  }

  async userHighlights(ref: number) {
    try {
      const response = {
        tasksToday: 2,
        hoursWorked: 120,
        level: 'Beginner',
        quotaAttainment: '85%',
        dealsWon: 2,
        prospectsContacted: 7,
        dealsClosed: 4,
      }

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
        tasks: null
      }

      return response;
    }
  }

  async dailyReportForUser(ref: number) {
    try {
      const date = new Date().toISOString().split('T')[0];
      const report = `
Daily Sales Report for ${date}

Hours Worked: 8.5 hours
Calls Made: 45
Emails Sent: 23
Meetings Attended: 4

Performance Summary:
- Generated 7 new leads
- Completed 12 follow-ups
- Generated 3 quotes
- Closed 1 deal
- Total Revenue: $15,000

Tasks:
✓ Follow up with ABC Corp
✓ Send proposal to XYZ Inc
□ Schedule demo with potential client

Notes: Good performance in follow-ups. Need to increase call volume tomorrow.
`;
      return { report };
    } catch (error) {
      return {
        message: error?.message,
        report: null
      };
    }
  }

  async salesReportForUser(ref: number) {
    return `This action returns sales report for user with reference code ${ref}`;
  }
}
