import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class AuthDto {
  @IsNotEmpty({
    message: 'username: không được bỏ trống',
  })
  @Matches(/^[a-z0-9]+$/, {
    message: 'username: chỉ được chứa a-z và 0-9',
  })
  @IsString({
    message: 'username: phải là một chuỗi',
  })
  username: string;

  @IsNotEmpty({
    message: 'password: không được bỏ trống',
  })
  @MinLength(12, {
    message: 'password: phải tối thiểu 12 kí tự',
  })
  @IsString({
    message: 'password: phải là một chuỗi',
  })
  password: string;
}
