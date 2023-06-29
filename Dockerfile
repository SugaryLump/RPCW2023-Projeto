FROM node

WORKDIR /app

COPY package.json .

RUN npm install

COPY . ./

RUN node_modules/.bin/tailwindcss -i public/stylesheets/style.css -o public/stylesheets/dist.css
RUN mkdir -p public/uploads && mkdir -p tmp

EXPOSE 7777

CMD ["npm", "start"]