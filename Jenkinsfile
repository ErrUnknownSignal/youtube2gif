pipeline {
    agent {
        docker {
            image 'node:12.20.0-alpine'
            args '-p 3000:3000'
        }
    }
    stages {
    	stage('Git Pull') {
    		git branch: 'master'
    	}
    	stage('angular Install') {
			steps {
				sh 'cd angular'
				sh 'npm install'
				sh 'npm run build'
			}
    	}
        stage('nestjs Build') {
			steps {
				sh 'npm install'
				sh 'npm run build'
			}
		}
		stage('nestjs Test') {
			steps {
				sh 'npm test'
			}
		}
    }
}