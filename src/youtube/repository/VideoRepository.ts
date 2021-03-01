import {EntityManager, EntityRepository, Repository} from "typeorm";
import {VideoEntity} from "../entity/Video.entity";


@EntityRepository(VideoEntity)
export class VideoRepository extends Repository<VideoEntity> {

    //TODO
    // https://www.npmjs.com/package/typeorm-transactional-cls-hooked
    // https://laptrinhx.com/a-transactional-method-decorator-for-typeorm-that-uses-cls-hooked-to-handle-and-propagate-transactions-between-different-repositories-and-service-methods-inpired-by-spring-trasnactional-annotation-and-sequelize-cls-188665142/
    // https://cherrypick.co.kr/typeorm-basic-transaction/
    async log(videoEntity: VideoEntity) {
        await this.manager.transaction(async (entityManager: EntityManager) => {
            await entityManager.save(videoEntity);
        }).catch((e) => {
            throw e;
        });
    }
}