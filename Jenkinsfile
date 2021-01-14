pipeline {
	agent {
		docker {
			image 'node:12.20.0-alpine'
		}
	}
	environment {
		HOME = '.'
// 		registry = "docker_hub_account/repository_name"
		registry = "y2g"
		registryHost = 'registryHost'
		registryCredential = 'privateRegistryCredential'
	}

    stages {
        stage('Build') {
            steps {
                git 'https://github.com/ErrUnknownSignal/youtube2gif'

                sh 'npm install'
                sh 'npm run build'
                sh 'cd angular'
                sh 'npm install'
                sh 'npm run build'
                sh 'npm prune --production'	//uninstall devDependencies for light image
            }
        }
        stage('Docker') {
        	steps {
				script {
					dockerImage = docker.build registry + ":$BUILD_NUMBER"

					dockerImage.inside() {
						dir('/app') {
							sh 'npm run test'
						}
					}
				}
        	}
        }
    }
}