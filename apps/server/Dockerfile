FROM node:20-alpine

RUN apk add --no-cache bash netcat-openbsd curl

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

RUN npm run build

ENV DATABASE_URL=mysql://root:password@localhost:3306/tda_app
ENV PORT=3000
ENV AUTH_TOKEN_SECRET=super_duper_secret_auth_token_secret
ENV PASSWORD_SALT=super_secret_password_salt

EXPOSE 3000

CMD ["/app/start.sh"]
