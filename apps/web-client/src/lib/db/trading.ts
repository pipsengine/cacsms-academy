import { AssetClass, Prisma, TradeDirection, TradePlanStatus, TradeSignalStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function ensureAsset(input: {
	symbol: string;
	name: string;
	assetClass: AssetClass;
	baseCurrency?: string;
	quoteCurrency?: string;
}) {
	return prisma.asset.upsert({
		where: { symbol: input.symbol },
		create: {
			symbol: input.symbol,
			name: input.name,
			assetClass: input.assetClass,
			baseCurrency: input.baseCurrency,
			quoteCurrency: input.quoteCurrency,
		},
		update: {
			name: input.name,
			assetClass: input.assetClass,
			baseCurrency: input.baseCurrency,
			quoteCurrency: input.quoteCurrency,
			isActive: true,
		},
	});
}

export async function upsertMarketCandle(input: {
	assetSymbol: string;
	timeframe: string;
	timestamp: Date;
	open: number;
	high: number;
	low: number;
	close: number;
	volume?: number;
}) {
	const asset = await prisma.asset.findUnique({ where: { symbol: input.assetSymbol }, select: { id: true } });
	if (!asset) {
		throw new Error(`Asset not found: ${input.assetSymbol}`);
	}

	return prisma.marketCandle.upsert({
		where: {
			assetId_timeframe_timestamp: {
				assetId: asset.id,
				timeframe: input.timeframe,
				timestamp: input.timestamp,
			},
		},
		create: {
			assetId: asset.id,
			timeframe: input.timeframe,
			timestamp: input.timestamp,
			open: input.open,
			high: input.high,
			low: input.low,
			close: input.close,
			volume: input.volume,
		},
		update: {
			open: input.open,
			high: input.high,
			low: input.low,
			close: input.close,
			volume: input.volume,
		},
	});
}

export async function createTradeSignal(input: {
	assetSymbol: string;
	timeframe: string;
	direction: TradeDirection;
	confidence: number;
	source: string;
	userId?: string;
	entryPrice?: number;
	stopLoss?: number;
	takeProfit?: number;
	rationale?: Prisma.InputJsonValue;
}) {
	const asset = await prisma.asset.findUnique({ where: { symbol: input.assetSymbol }, select: { id: true } });
	if (!asset) {
		throw new Error(`Asset not found: ${input.assetSymbol}`);
	}

	return prisma.tradeSignal.create({
		data: {
			userId: input.userId,
			assetId: asset.id,
			timeframe: input.timeframe,
			direction: input.direction,
			confidence: Math.max(0, Math.min(100, Math.round(input.confidence))),
			source: input.source,
			entryPrice: input.entryPrice,
			stopLoss: input.stopLoss,
			takeProfit: input.takeProfit,
			rationale: input.rationale,
		},
		include: {
			asset: true,
		},
	});
}

export async function markTradeSignalStatus(signalId: string, status: TradeSignalStatus) {
	return prisma.tradeSignal.update({
		where: { id: signalId },
		data: {
			status,
			resolvedAt: status === 'OPEN' ? null : new Date(),
		},
	});
}

export async function createTradePlan(input: {
	userId: string;
	assetSymbol: string;
	timeframe: string;
	direction: TradeDirection;
	riskPercent: number;
	entryPrice: number;
	stopLoss: number;
	takeProfit: number;
	notes?: string;
}) {
	const asset = await prisma.asset.findUnique({ where: { symbol: input.assetSymbol }, select: { id: true } });
	if (!asset) {
		throw new Error(`Asset not found: ${input.assetSymbol}`);
	}

	return prisma.tradePlan.create({
		data: {
			userId: input.userId,
			assetId: asset.id,
			timeframe: input.timeframe,
			direction: input.direction,
			riskPercent: input.riskPercent,
			entryPrice: input.entryPrice,
			stopLoss: input.stopLoss,
			takeProfit: input.takeProfit,
			notes: input.notes,
		},
		include: {
			asset: true,
		},
	});
}

export async function updateTradePlanStatus(planId: string, status: TradePlanStatus) {
	return prisma.tradePlan.update({
		where: { id: planId },
		data: { status },
	});
}

export async function createTradeExecution(input: {
	userId: string;
	assetSymbol: string;
	direction: TradeDirection;
	quantity: number;
	openPrice?: number;
	stopLoss?: number;
	takeProfit?: number;
	signalId?: string;
	planId?: string;
	metadata?: Prisma.InputJsonValue;
}) {
	const asset = await prisma.asset.findUnique({ where: { symbol: input.assetSymbol }, select: { id: true } });
	if (!asset) {
		throw new Error(`Asset not found: ${input.assetSymbol}`);
	}

	return prisma.tradeExecution.create({
		data: {
			userId: input.userId,
			assetId: asset.id,
			direction: input.direction,
			quantity: input.quantity,
			openPrice: input.openPrice,
			stopLoss: input.stopLoss,
			takeProfit: input.takeProfit,
			signalId: input.signalId,
			planId: input.planId,
			metadata: input.metadata,
			status: input.openPrice != null ? 'OPEN' : 'PENDING',
			openedAt: input.openPrice != null ? new Date() : null,
		},
		include: {
			asset: true,
		},
	});
}

export async function closeTradeExecution(input: {
	executionId: string;
	closePrice: number;
	fees?: number;
}) {
	const execution = await prisma.tradeExecution.findUnique({ where: { id: input.executionId } });
	if (!execution) {
		throw new Error('Trade execution not found');
	}

	const quantity = execution.quantity;
	const openPrice = execution.openPrice ?? input.closePrice;
	const directionMultiplier = execution.direction === 'LONG' ? 1 : -1;
	const grossPnl = (input.closePrice - openPrice) * quantity * directionMultiplier;
	const fees = input.fees ?? execution.fees;
	const realizedPnl = grossPnl - fees;

	return prisma.tradeExecution.update({
		where: { id: input.executionId },
		data: {
			status: 'CLOSED',
			closePrice: input.closePrice,
			closedAt: new Date(),
			fees,
			realizedPnl,
		},
	});
}

export async function openPosition(input: {
	userId: string;
	assetSymbol: string;
	direction: TradeDirection;
	quantity: number;
	averageEntry: number;
	stopLoss?: number;
	takeProfit?: number;
}) {
	const asset = await prisma.asset.findUnique({ where: { symbol: input.assetSymbol }, select: { id: true } });
	if (!asset) {
		throw new Error(`Asset not found: ${input.assetSymbol}`);
	}

	return prisma.position.create({
		data: {
			userId: input.userId,
			assetId: asset.id,
			direction: input.direction,
			quantity: input.quantity,
			averageEntry: input.averageEntry,
			stopLoss: input.stopLoss,
			takeProfit: input.takeProfit,
			status: 'OPEN',
		},
		include: {
			asset: true,
		},
	});
}

export async function closePosition(input: {
	positionId: string;
	closePrice: number;
}) {
	const position = await prisma.position.findUnique({ where: { id: input.positionId } });
	if (!position) {
		throw new Error('Position not found');
	}

	const directionMultiplier = position.direction === 'LONG' ? 1 : -1;
	const realizedPnl = (input.closePrice - position.averageEntry) * position.quantity * directionMultiplier;

	return prisma.position.update({
		where: { id: input.positionId },
		data: {
			status: 'CLOSED',
			closedAt: new Date(),
			realizedPnl,
			unrealizedPnl: null,
		},
	});
}

export async function createJournalEntry(input: {
	userId: string;
	title: string;
	notes: string;
	emotions?: string;
	tags?: Prisma.InputJsonValue;
	rating?: number;
	tradeExecutionId?: string;
}) {
	return prisma.journalEntry.create({
		data: {
			userId: input.userId,
			title: input.title,
			notes: input.notes,
			emotions: input.emotions,
			tags: input.tags,
			rating: input.rating,
			tradeExecutionId: input.tradeExecutionId,
		},
	});
}

export async function listOpenPositions(userId: string) {
	return prisma.position.findMany({
		where: { userId, status: 'OPEN' },
		include: { asset: true },
		orderBy: { openedAt: 'desc' },
	});
}

export async function listRecentSignals(input: {
	assetSymbol?: string;
	timeframe?: string;
	limit?: number;
}) {
	const limit = Math.max(1, Math.min(input.limit ?? 50, 200));

	return prisma.tradeSignal.findMany({
		where: {
			timeframe: input.timeframe,
			asset: input.assetSymbol
				? {
						symbol: input.assetSymbol,
					}
				: undefined,
		},
		include: { asset: true },
		orderBy: { createdAt: 'desc' },
		take: limit,
	});
}
