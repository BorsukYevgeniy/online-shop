import KeyvRedis from '@keyv/redis';
import { CacheModuleOptions } from '@nestjs/cache-manager';
import { registerAs } from '@nestjs/config';
import Keyv from 'keyv';

export default registerAs('redis', (): CacheModuleOptions => ({
  stores: new Keyv({
    store: new KeyvRedis(process.env.REDIS_URL),
    namespace: '',
    useKeyPrefix: false,
  }),
  ttl: Number(process.env.REDIS_TT),
}));
