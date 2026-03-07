import type { Request, Response, NextFunction } from 'express';


export function createDataset(_req: Request, res: Response, _next: NextFunction) {
    res.status(500).json({
        'message': 'NOT IMPLEMENTED'
    });
}

export function getDatasets(_req: Request, res: Response, _next: NextFunction) {
    res.status(500).json({
        'message': 'NOT IMPLEMENTED'
    });
}

export function updateDataset(_req: Request, res: Response, _next: NextFunction) {
    res.status(500).json({
        'message': 'NOT IMPLEMENTED'
    });
}

export function ingestData(_req: Request, res: Response, _next: NextFunction) {
    res.status(500).json({
        'message': 'NOT IMPLEMENTED'
    });
}

export function deleteDataset(_req: Request, res: Response, _next: NextFunction) {
    res.status(500).json({
        'message': 'NOT IMPLEMENTED'
    });
}
