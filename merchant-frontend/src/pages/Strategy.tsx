import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  Target,
  TrendingUp,
  DollarSign,
  Clock,
  Percent,
  AlertCircle,
  Info,
  Play,
  Pause,
  Settings
} from 'lucide-react';
import type { Strategy, StrategyCondition } from '@/types';

export function Strategy() {
  const [showIntroPopup, setShowIntroPopup] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    type: 'limit_order' as 'limit_order' | 'dca',
    token: 'ETH',
    conditions: [] as StrategyCondition[]
  });

  // Check if user has seen the intro popup
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('strategy-intro-seen');
    if (!hasSeenIntro) {
      setShowIntroPopup(true);
    }
  }, []);

  const handleIntroClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('strategy-intro-seen', 'true');
    }
    setShowIntroPopup(false);
  };

  const addCondition = () => {
    const newCondition: StrategyCondition = {
      id: Date.now().toString(),
      type: 'percentage',
      value: 0,
      unit: '%',
      operator: 'greater_than'
    };
    setNewStrategy(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition]
    }));
  };

  const removeCondition = (conditionId: string) => {
    setNewStrategy(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c.id !== conditionId)
    }));
  };

  const updateCondition = (conditionId: string, field: keyof StrategyCondition, value: any) => {
    setNewStrategy(prev => ({
      ...prev,
      conditions: prev.conditions.map(c => 
        c.id === conditionId ? { ...c, [field]: value } : c
      )
    }));
  };

  const createStrategy = () => {
    if (!newStrategy.name.trim() || newStrategy.conditions.length === 0) {
      return;
    }

    const strategy: Strategy = {
      id: Date.now().toString(),
      name: newStrategy.name,
      type: newStrategy.type,
      status: 'active',
      token: newStrategy.token,
      conditions: newStrategy.conditions,
      createdAt: new Date().toISOString(),
      totalInvested: 0,
      totalTokens: 0
    };

    setStrategies(prev => [...prev, strategy]);
    setNewStrategy({
      name: '',
      type: 'limit_order',
      token: 'ETH',
      conditions: []
    });
    setIsCreateModalOpen(false);
  };

  const toggleStrategyStatus = (strategyId: string) => {
    setStrategies(prev => prev.map(s => 
      s.id === strategyId 
        ? { ...s, status: s.status === 'active' ? 'paused' : 'active' }
        : s
    ));
  };

  const deleteStrategy = (strategyId: string) => {
    setStrategies(prev => prev.filter(s => s.id !== strategyId));
  };

  return (
    <div className="p-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-left">Strategy</h1>
          <p className="text-gray-600 mt-2">
            Configure automated trading strategies for your cryptocurrency portfolio.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-amber-300 hover:bg-amber-50">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button 
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Strategy
          </Button>
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strategy) => (
          <Card key={strategy.id} className="border-amber-100 bg-gradient-to-br from-white to-amber-50/30 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Target className="h-5 w-5 mr-2 text-amber-600" />
                  {strategy.name}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={strategy.status === 'active' ? 'default' : 'secondary'}
                    className={strategy.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                  >
                    {strategy.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStrategyStatus(strategy.id)}
                  >
                    {strategy.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Badge variant="outline" className="text-xs">
                  {strategy.type === 'limit_order' ? 'Limit Order' : 'DCA'}
                </Badge>
                <span>•</span>
                <span>{strategy.token}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Invested</p>
                    <p className="font-semibold">${strategy.totalInvested.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Tokens</p>
                    <p className="font-semibold">{strategy.totalTokens.toFixed(4)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Conditions:</p>
                  {strategy.conditions.map((condition) => (
                    <div key={condition.id} className="text-xs bg-gray-50 p-2 rounded">
                      {condition.type === 'percentage' && (
                        <span>Convert {condition.value}% of USDC inflow</span>
                      )}
                      {condition.type === 'amount' && (
                        <span>When amount {condition.operator} ${condition.value}</span>
                      )}
                      {condition.type === 'time' && (
                        <span>Every {condition.value} {condition.unit}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 border-amber-300 hover:bg-amber-50">
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 border-red-300 hover:bg-red-50 text-red-600"
                    onClick={() => deleteStrategy(strategy.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {strategies.length === 0 && (
        <Card className="border-amber-100 bg-gradient-to-br from-white to-amber-50/30">
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-amber-600 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No strategies yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first automated trading strategy to start building your portfolio.
            </p>
            <Button 
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Strategy
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Strategy Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Strategy</DialogTitle>
            <DialogDescription>
              Configure automated trading parameters for your cryptocurrency strategy.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Label htmlFor="strategy-name" className="text-left sm:col-span-1">
                Strategy Name
              </Label>
              <Input
                id="strategy-name"
                value={newStrategy.name}
                onChange={(e) => setNewStrategy(prev => ({ ...prev, name: e.target.value }))}
                placeholder="DCA Strategy"
                className="sm:col-span-2"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Label htmlFor="strategy-type" className="text-left sm:col-span-1">
                Strategy Type
              </Label>
              <div className="sm:col-span-2">
                <Select
                  value={newStrategy.type}
                  onValueChange={(value: 'limit_order' | 'dca') => setNewStrategy(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="limit_order">Limit Order</SelectItem>
                    <SelectItem value="dca">Dollar Cost Averaging (DCA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Label htmlFor="token" className="text-left sm:col-span-1">
                Target Token
              </Label>
              <div className="sm:col-span-2">
                <Select
                  value={newStrategy.token}
                  onValueChange={(value) => setNewStrategy(prev => ({ ...prev, token: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="SOL">SOL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="col-span-5">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-left font-medium">Conditions</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addCondition}
                  className="border-amber-300 hover:bg-amber-50"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Condition
                </Button>
              </div>
              
              <div className="space-y-4">
                {newStrategy.conditions.map((condition, index) => (
                  <div key={condition.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Condition {index + 1}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCondition(condition.id)}
                        className="bg-white border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">Type</Label>
                        <Select
                          value={condition.type}
                          onValueChange={(value: 'percentage' | 'amount' | 'time') => 
                            updateCondition(condition.id, 'type', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="amount">Amount</SelectItem>
                            <SelectItem value="time">Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">Value</Label>
                        <Input
                          type="number"
                          value={condition.value}
                          onChange={(e) => updateCondition(condition.id, 'value', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">Unit</Label>
                        <Select
                          value={condition.unit}
                          onValueChange={(value) => updateCondition(condition.id, 'unit', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {condition.type === 'percentage' && <SelectItem value="%">%</SelectItem>}
                            {condition.type === 'amount' && (
                              <>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="USDC">USDC</SelectItem>
                              </>
                            )}
                            {condition.type === 'time' && (
                              <>
                                <SelectItem value="minutes">Minutes</SelectItem>
                                <SelectItem value="hours">Hours</SelectItem>
                                <SelectItem value="days">Days</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          More Options
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={createStrategy}
              disabled={!newStrategy.name.trim() || newStrategy.conditions.length === 0}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            >
              Create Strategy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Intro Popup */}
      <Dialog open={showIntroPopup} onOpenChange={setShowIntroPopup}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-amber-600" />
              Welcome to Strategy
            </DialogTitle>
            <DialogDescription>
              Automate your cryptocurrency trading with intelligent strategies. Set your own strategy with multiple conditions to create sophisticated strategies that match your investment goals.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium">Limit Orders</h4>
                <p className="text-sm text-gray-600">
                  Set percentage of USDC inflow to convert to your chosen token with conditions like maximum amount and time limits.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <DollarSign className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium">Dollar Cost Averaging (DCA)</h4>
                <p className="text-sm text-gray-600">
                  Automatically invest fixed amounts at regular intervals to reduce market timing risk.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className="flex items-center space-x-2 w-full">
              <input 
                type="checkbox" 
                id="dont-show-again"
                className="rounded text-gray-600 checked:bg-gray-600" 
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              <Label htmlFor="dont-show-again" className="text-sm">
                Don't show this again
              </Label>
            </div>
            <Button 
              onClick={handleIntroClose}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            >
              Get Started
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
