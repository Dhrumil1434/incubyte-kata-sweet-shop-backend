import { sweetRepository } from './sweet.repository';
import {
  sweetSelectSchema,
  ISweetCreate,
  ISweetUpdate,
  ISweetListQuery,
  ISweetSearchQuery,
} from './sweet.zod';

export class SweetService {
  static async createSweet(data: ISweetCreate, _userRole: string) {
    const created = await sweetRepository.create(data);
    return sweetSelectSchema.parse(created);
  }

  static async getSweetById(id: number, userRole: string) {
    const sweet = await sweetRepository.findById(id, userRole);
    return sweet ? sweetSelectSchema.parse(sweet) : null;
  }

  static async listSweets(query: ISweetListQuery, userRole: string) {
    const result = await sweetRepository.list(query, userRole);
    return {
      items: result.items.map((i) => sweetSelectSchema.parse(i)),
      total: result.total,
      pagination: result.pagination,
    };
  }

  static async searchSweets(query: ISweetSearchQuery, userRole: string) {
    const items = await sweetRepository.search(query, userRole);
    return items.map((i) => sweetSelectSchema.parse(i));
  }

  static async updateSweet(id: number, data: ISweetUpdate, _userRole: string) {
    const updated = await sweetRepository.update(id, data);
    return sweetSelectSchema.parse(updated);
  }

  static async deleteSweet(id: number, _userRole: string) {
    const deleted = await sweetRepository.softDelete(id);
    return sweetSelectSchema.parse(deleted);
  }
}
