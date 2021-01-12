pipeline {
    agent any
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