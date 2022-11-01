import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ConfigModule.forRoot(),
  TypeOrmModule.forRoot({
    type: 'postgres',
    host:process.env.BD_HOST,
    port:+process.env.DB_PORT,
    database:process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    autoLoadEntities:true,
    synchronize:true, 
    



  })
],
  
})
export class AppModule {}
