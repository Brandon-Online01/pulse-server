import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OrderStatus } from '../lib/enums/status.enums';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})


export class ShopGateway {
    @WebSocketServer()
    server: Server;

    emitNewQuotation(quotationNumber: string) {
        this.server.emit('newQuotation', { quotationNumber });
    }

    notifyQuotationStatusChanged(quotationId: number, status: OrderStatus) {
        this.server.emit('quotationStatusChanged', { 
            quotationId,
            status
        });
    }
} 