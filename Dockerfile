FROM node:10
ADD . /backend/
WORKDIR /backend
CMD ["node","app.js"]