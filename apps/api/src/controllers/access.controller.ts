import type { Request, Response, NextFunction } from 'express';


export function getAccesses(_req: Request, res: Response, _next: NextFunction) {
    res.status(500).json({
        'message': 'NOT IMPLEMENTED'
    });
}

export function updateAccess(_req: Request, res: Response, _next: NextFunction) {
    res.status(500).json({
        'message': 'NOT IMPLEMENTED'
    });
}

export function revokeAccess(_req: Request, res: Response, _next: NextFunction) {
    res.status(500).json({
        'message': 'NOT IMPLEMENTED'
    });
}
