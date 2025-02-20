import { IsNotEmpty, Matches, MinLength } from 'class-validator';

export class AuthDto {
  @IsNotEmpty({
    message: 'username: không được bỏ trống',
  })
  @Matches(/^[a-z0-9]+$/, {
    message: 'username: chỉ được chứa a-z và 0-9',
  })
  username: string;

  @IsNotEmpty({
    message: 'password: không được bỏ trống',
  })
  @Matches(/^\S+$/, {
    message: 'password: không được chứa khoảng trắng',
  })
  @MinLength(12, {
    message: 'password: phải tối thiểu 12 kí tự',
  })
  password: string;
}
