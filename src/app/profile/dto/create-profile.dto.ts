import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { contains, IsEmail, IsEmpty, IsNotEmpty, IsOptional, MaxLength, maxLength, MinLength, useContainer, validate, ValidateBy, ValidateIf } from 'class-validator';

export class CreateProfileDto {

    @ApiPropertyOptional()
    @MaxLength(50)
    @IsOptional()
    name?: String;

    @ApiPropertyOptional()
    @IsOptional()
    @MaxLength(1000)
    bio: String;

    @ApiPropertyOptional({
        example: 'example@gmail.com',
        description: 'email',
    })
    @IsOptional()
    @IsEmail()
    email: String;

    @ApiPropertyOptional()
    @IsOptional()
    @MaxLength(50)
    username: String;

    @ApiPropertyOptional()
    @IsOptional()
    avatar: String; //Express.Multer.File;

    @ApiPropertyOptional()
    @IsOptional()
    banner: String; //.Multer.File;

    @ApiPropertyOptional()
    @IsOptional()
    social: [{
        key: String,
        value: String,
    }]

    @ApiPropertyOptional()
    @IsOptional()
    ens: String; //.Multer.File;
    // social: {
    //     insta: String;
    //     twitter: String;
    //     website: String;
    // };

    // @ApiPropertyOptional()
    // notif_allow: [{
    //     action: String,
    //     allow: boolean,
    // }];
}
