import {KafkaConfig} from "kafkajs";


export class KafkaConfigServiceImpl {

    // public getKafkaOptions(): KafkaOptions | null {
    public getKafkaOptions(): KafkaConfig | null {
        if (!process.env.KAFKA_SERVER) {
            return null;
        }
        // return {
        //     transport: Transport.KAFKA,
        //     options: {
        //         client: {
        //             brokers: process.env.KAFKA_SERVER.split(' '),
        //         },
        //     }
        // };
        return {
            brokers: process.env.KAFKA_SERVER.split(' ')
        };
    }
}