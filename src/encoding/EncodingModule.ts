import {Module} from "@nestjs/common";
import {SimpleWorkerService} from "./service/impl/SimpleWorkerService";
import {EncodingBroker} from "./service/EncodingBroker";
import {QueueBrokerService} from "./service/impl/QueueBrokerService";
import {SimpleBrokerService} from "./service/impl/SimpleBrokerService";
import {EncodingWorker} from "./service/EncodingWorker";
import {QueueWorkerService} from "./service/impl/QueueWorkerService";
import {FFMPEGService} from "./service/FFMPEGService";
import {FFMPEGServiceImpl} from "./service/impl/FFMPEGServiceImpl";
import {KafkaConfigServiceImpl} from "./service/impl/KafkaConfigServiceImpl";
import {TemporaryFileServiceImpl} from "./service/impl/TemporaryFileServiceImpl";
import {CONSUMER_GROUP} from "../main";
import {Kafka} from "kafkajs";


@Module({
 providers: [
  {provide: 'TemporaryFileService', useClass: TemporaryFileServiceImpl},
  {provide: KafkaConfigServiceImpl, useClass: KafkaConfigServiceImpl},
  {
   provide: Kafka,
   useFactory: (kafkaConfigService: KafkaConfigServiceImpl) => {
    const kafkaConfig = kafkaConfigService.getKafkaOptions();
    if (!kafkaConfig) {
     return undefined;
    }
    return new Kafka(kafkaConfig);
   },
   inject: [KafkaConfigServiceImpl]
  },
  {provide: FFMPEGService, useClass: FFMPEGServiceImpl},
  {provide: EncodingBroker, useClass: process.env.KAFKA_SERVER? QueueBrokerService : SimpleBrokerService},
  // {provide: 'SimpleEncoder', useClass: SimpleEncodingHandlingService},
  {provide: EncodingWorker, useClass: (process.env.ENCODING_SERVER && process.env.KAFKA_SERVER)? QueueWorkerService : (!process.env.ENCODING_SERVER && process.env.KAFKA_SERVER)? null : SimpleWorkerService},
  {provide: 'workerGroupId', useValue: CONSUMER_GROUP}
 ],
 exports: [
  EncodingBroker
 ]
})
export class EncodingModule {

 }