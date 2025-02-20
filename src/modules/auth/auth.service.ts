import { Injectable } from '@nestjs/common';

import { AuthDto } from './dto/auth.dto';

@Injectable({})
export class AuthService {
  constructor(
  ) {}

  /**
   * Verify if user is logged in
   * Return the jwt token if yes
   *
   * @param {number} deviceId - device id of user
   * @param {string} username - username of user
   * @param {string} password - password
   *
   * @return {Promise<object>} the object contains jwt token
   */
  async login(deviceId, dto: AuthDto) {}
}
