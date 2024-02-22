FROM mysql:8.0.30

COPY init/init.sql /docker-entrypoint-initdb.d/init.sql

EXPOSE 3306

CMD ["mysqld"]