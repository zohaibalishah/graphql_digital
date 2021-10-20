# git pull
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 510735507118.dkr.ecr.us-east-1.amazonaws.com/chainstarters_ecr
docker build -t chainstarters_ecr .	
docker tag chainstarters_ecr:latest 510735507118.dkr.ecr.us-east-1.amazonaws.com/chainstarters_ecr:$1	
docker push 510735507118.dkr.ecr.us-east-1.amazonaws.com/chainstarters_ecr:$1
helm upgrade --set projectName=digitall --set image.version=$1 --set --namespace=digitall-gql digitall graphql-helm