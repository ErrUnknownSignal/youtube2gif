

// 임시 파일 만들기 서비스 (일반 서버에서 할 때, AWS S3에 할 때 확장하기 위해 인터페이스로 분리)
export interface TemporaryFileService {

    createTemporaryFile(extension: string): string;
}