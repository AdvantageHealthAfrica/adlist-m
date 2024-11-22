FROM node:22-alpine As development

# setting the image working directory
WORKDIR /code

# copy package.json and package-lock.json to the image working directory
COPY package*.json ./

# update npm
RUN npm install -g npm@10.8.0

# install development dependencies
# RUN npm install --only=development
RUN npm install 

# copy the application code to the working directory of image
COPY . .

# RUN rm -rf ./dist

EXPOSE 3000

#  build the application
RUN npm run build



FROM node:17-alpine As production

# # defining a variable, NODE_ENV
# ARG NODE_ENV=production

# # setting node environment variable to production
# ENV NODE_ENV=${NODE_ENV}

# setting the working directory of image
WORKDIR /code

# copy package.json and package-lock.json to the image working directory
COPY package*.json ./

#  so that Typescript isn't installed in the production image
RUN npm install --only=production --force

COPY . .

#  copy the compiled javascript code to out production image
COPY --from=development code/dist ./dist

EXPOSE 3000
# run the application
CMD ["node", "dist/main"]