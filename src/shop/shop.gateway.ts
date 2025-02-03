import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

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
} 