FROM node:18.19.0

WORKDIR /app

ENV PORT 3000
ENV DATABASE_URL postgresql://postgres:supersecret123@docker-postgres:5432/mydb?schema=public
ENV YEAR_RANGE 10
ENV CURRENT_YEAR 2020

COPY . /app

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start"]