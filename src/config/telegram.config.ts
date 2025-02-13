import { ConfigService } from '@nestjs/config';
import { ITelegramOptions } from '../telegram/telegram-options.interface';

export const getTelegramConfig = async (
	configService: ConfigService,
): Promise<ITelegramOptions> => {
	const token = configService.get<string>('TELEGRAM_TOKEN');
	if (!token) {
		throw new Error('No telegram token provided');
	}
	return {
		token,
		chatId: configService.get<string>('TELEGRAM_CHAT_ID') ?? '',
	};
};
