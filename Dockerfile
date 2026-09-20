FROM nginx:alpine

# Limpa o diretório padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia a configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos do site das Novelinhas VIP
COPY . /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
