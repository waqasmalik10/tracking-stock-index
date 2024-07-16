import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IndicesService } from './indices.service';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { UpdateThoresholdDto } from './dtos/update-throeshold.dto';
import { Request } from 'express';
@Controller('indices')
export class IndicesController {
  constructor(private readonly indicesService: IndicesService) {}

  @UseGuards(FirebaseAuthGuard)
  @Put('get-snapshot')
  async setIndexSnapShot() {
    return this.indicesService.getIndicesSnapshot();
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('get-indices-snapshot')
  async getIndicesSnapshot() {
    return this.indicesService.getIndicesSnapshot();
  }

  @UseGuards(FirebaseAuthGuard)
  @Get(':index')
  async getIndexData(
    @Param('index') stockIndex: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.indicesService.getIndexData(stockIndex, [startDate, endDate]);
  }

  @UseGuards(FirebaseAuthGuard)
  @Put('set-index-threshold/:index')
  async setIndexThreshold(
    @Req() request: Request,
    @Param('index') index: string,
    @Body() updateThresholdDto: UpdateThoresholdDto,
  ) {
    const uid = request?.['user']?.uid;
    return this.indicesService.setThroeshold(uid, index, updateThresholdDto);
  }

  @Post('process-threshold')
  async processThreshold() {
    return await this.indicesService.processThresholds();
  }
}
